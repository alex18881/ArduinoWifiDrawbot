var express = require('express'),
	telnet = require('telnet-client'),
	router = express.Router(),
	connection,
	params = null,
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

function exec( cmds ){
	if(!cmds.length){
		return Promise.resolve(cmds);
	}

	var cmd = cmds.shift();
	
	console.log( "BOT %d > %s", cmds.length, cmd );
	status.message = utils.format('Running. %d commands left', cmds.length);

	return connection.exec(cmd, params)
		.then(
			(pr) => {
				console.log( "BOT OK: ");
				return exec(cmds, connection);
			}
		);
}

function execCommands(cmds) {
	connectToBot().then( () => {
		return exec(cmds);
	} )
	.then( () => {} )
	.catch( () => {} );
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
				timeout: params.timeout
			}).then( resolve, reject );
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
				res.json('ok');
				next();
			})
			.catch( (err) => {
				status.connected = false;
				res.status(500).json(err);
				next();
			} );
	}
}

function move(req, res, next) {
	execCommands(['G91', 'G0 X' + (+req.params.distanceX) + ' Y' + (+req.params.distanceY || 0)]);
	res.json('ok');
}

function togglePen(req, res, next) {
	execCommands([req.params.val == 'on' ? 'M3' : 'M5']);
	res.json('ok');
}

function execFile( req, res, next ) {
	collection.loadFile(req.body.filename)
		.then( (arrCmds) => {
			execCommands(arrCmds);
			res.json('ok');
			next();
		} )
		.catch( (err) => {
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

module.exports = function( settings, collection ){
	params = settings;
	return {
		api: router
	};
};