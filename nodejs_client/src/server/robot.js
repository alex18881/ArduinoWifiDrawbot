var express = require('express'),
	telnet = require('telnet-client'),
	utils = require('util'),
	router = express.Router(),
	connection,
	collection,
	params = null,
	versionTimer,
	pingPeriod = 3000,

	status = {
		version: '',
		connected: false,
		error: null,
		message: ''
	};

function getStatus( req, res, next ) {
	res.json(status);
	next();
}

function exec( cmd ){
		
	console.log( "BOT > %s", cmd );

	return connection.send(cmd, {
		waitfor : '>'
	});
}

function execCommands(cmds) {
	return connectToBot()
		.then( () => {
			status.message = utils.format('Running. %d commands left', cmds.length);
			return exec(cmds.shift());
		} )
		.then( (result) => {
			if(cmds.length)
				return execCommands(cmds);
			else
				return result;
		} )
		.catch( (err) => {
			console.log('Exec commands error:', err);
		} );
}

function getVersion() {
	return stopGetVerion()
		.then(()=>{
			return exec(['M115']);
		})
		.then( (resp) => {
			var result = {};

			([]).concat( resp.replace(/[\n\r>]/gm, '').split(/\s/) || [] )
				.forEach( (a) => {
					var item = (a||'').trim().split(':'),
						res = null;
					if( item.length && item[0] ) {
						result[item[0].trim()] = (item[1] || "").trim();
					}
					return res;
				});

			console.log('BOT M115: ', JSON.stringify(result));
			status.version = result.PROTOCOL_VERSION;
			status.fwCodeName = result.FIRMWARE_NAME;
			status.machineType = result.MACHINE_TYPE;

			versionTimer = setTimeout( getVersion, pingPeriod );
		})
		.catch( (err) => {
			console.log('BOT M115 Error: ', err);
			status.error = err;
		});
}

function stopGetVerion() {
	return Promise.resolve(versionTimer).then( (a)=> {
		clearTimeout(a);
		return true;
	});
}

function connectToBot() {
	return new Promise( (resolve, reject) => {

		if(!connection || !status.connected) {
			connection = new telnet();

			connection.on('timeout', (err) => {
				console.log("BOT Connection timed out", err);
				if(connection)
					connection.end();
				reject();
			});

			connection.on('error', (err) => {
				status.error = err;
				console.log('BOT ERR:', err);
				if(connection)
					connection.end();
				reject(err);
			} );

			connection.on('close', () => {
				console.log('BOT connection closed');
				connection = null;
				status.connected = false;
			});

			return connection.connect({
				host: params.host,
				port: params.port,
				shellPrompt: params.shellPrompt,
				timeout: params.timeout,
				echoLines: 0,
				irs: '\n',
				ors: '\n',
				debug: true
			})
				.then( getVersion )
				.then( resolve, reject );
		} else {
			resolve(connection);
		}
	} );
}

function connect( req, res, next ) {
	connectToBot().then(
			(prompt) => {
				console.log( "BOT Connected: " + prompt );
				status.connected = true;
				status.error = null;
				res.json('ok');
				res.end();
			},
			(err) => {
				console.log('BOT error connecting', err);
				res.status(500).json(err);
				res.end();
			}
		).catch(
			(err) => {
				console.log('Catch BOT error connecting', err);
				connection = null;
				status.connected = false;
				res.status(500).json(err);
				res.end();
			}
		);
}
function disconnect( req, res, next ) {
	if(connection && status.connected) {
		connection.end()
			.then( () => {
				status.connected = false;
				status.error = null;
				res.json('ok');
				next();
			})
			.catch( (err) => {
				status.connected = false;
				status.error = err;
				res.status(500).json(err);
				next();
			} );
	}
}

function move(req, res, next) {
	stopGetVerion()
		.then(()=>{
			res.json('ok');
			return execCommands(['G91', 'G0 X' + (+req.params.distanceX) + ' Y' + (+req.params.distanceY || 0)]);
		})
		.then(getVersion);
}

function togglePen(req, res, next) {
	stopGetVerion()
		.then( ()=> {
			res.json('ok');
			return execCommands([req.params.val == 'on' ? 'M3' : 'M5']);
		})
		.then(getVersion);
}

function execFile( req, res, next ) {
	stopGetVerion()
		.then( ()=> {
			return collection.loadFile(req.body.filename)
		})
		.then( (arrCmds) => {
			console.log('loading file %s commands %d', req.body.filename, arrCmds.length );
			res.json('ok');
			next();
			return execCommands(arrCmds);
		} )
		.then(getVersion)
		.catch( (err) => {
			console.log('BOT: Error loading file %s', req.body.filename, err);
			res.status(500).json(err);
			next();
		} );
}

router.post("/connect", connect);
router.post("/disconnect", disconnect);

router.get( "/togglepen/:val", togglePen);
router.get( "/move/:distanceX/:distanceY?", move);
router.post( "/exec", execFile);

router.get("/status", getStatus);

module.exports = function( settings, collectionInst ){
	collection = collectionInst;
	params = settings;
	return {
		api: router
	};
};