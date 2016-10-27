var telnet = require('telnet-client'),
	fs = require("fs"),
	path = require('path'),
	utils = require('util'),
	isRunning = false,
	runStatus = null,
	express = require('express'),
	router = express.Router(),
	gCodeRoot = "./g-code",

	validCommands = { "G": 1, "M": 1 },
	params = {
		host: '192.168.1.9',
		port: 1336,
		shellPrompt: '>',
		timeout: 30000,
		//commandTimeout: 60000
	};

function exec( cmds, connection ){
	if(!cmds.length){
		return Promise.resolve(cmds);
	}

	var cmd = cmds.shift();
	
	console.log( cmds.length + ">" + cmd );
	runStatus = { error: false, message: utils.format('Running. %d commands left', cmds.length) };

	return connection.exec(cmd, params)
		.then(
			(pr) => {
				console.log( "OK: ");
				return exec(cmds, connection);
			}
		);
}

function execCommands(commands) {
	var connection = new telnet();
	connection.on('timeout', (err) => {
		console.log("Connection timed out", err);
		runStatus = { error: true, message: "Connection timed out" };
		if(connection)
			connection.end();
		connection = null;
		isRunning = false;
	});

	connection.on('error', (err) => {
		runStatus = { error: true, message: err };
		console.log('ERR:', err);
		if(connection)
			connection.end();
		connection = null;
	} );

	connection.on('close', function() {
		console.log('connection closed');
		connection = null;
		isRunning = false;
	});

	connection.connect({
		host: params.host,
		port: params.port,
		shellPrompt: params.shellPrompt,
		timeout: params.timeout
	}).then(
			(prompt) => {
				console.log( "Connected: " + prompt );
				console.log( "Executing %s commands", commands.length );
				return exec( commands, connection );
			}
		).then(
			()=> {
				console.log( "DONE!" );
				runStatus = { error: false, message: "Done"};
				isRunning = false;
				if(connection)
					connection.end();
				connection = null;
			}
		).catch(
			(err) => {
				console.log( "Error!", err );
				runStatus = { error: true, message: err };
				isRunning = false;
				if(connection)
					connection.end();
				connection = null;
			}
		);
}

function execGCode(req, res, next) {
	if(isRunning) {
		res.code(409).json({ error: true, message: 'Already running' });
		return;
	}

	var filename = path.join( gCodeRoot, req.params.filename);

	isRunning = true;

	console.log( "Reading file: %s", filename );
	runStatus = { error: false, message: "Starting" };

	fs.readFile( filename, "utf8", (fileErr, data)=>{
		
		if (fileErr) {
			runStatus = { error: true, message: fileErr };
			isRunning = false;
			res.code(409).json({ error: true, message: fileErr });
			return;
		}

		var commands = data.replace("\r", "").split( "\n" )
			.filter( (a)=>{ return !!a.trim() && validCommands[a.charAt(0)]; } );

		runStatus = { error: false, message: "Connecting"};
		console.log( "Connecting to bot: %s:%d", params.host, params.port);

		execCommands(commands);
		getRunStatus(req, res, next);
	} );
}

function move(req, res, next) {
	execCommands(['G90', 'G0 X' + (+req.params.distanceX) + ' Y' + (+req.params.distanceY || 0)]);
	getRunStatus(req, res, next);
}

function togglePen(req, res, next) {
	execCommands([req.params.val == 'on' ? 'M3' : 'M5']);
	getRunStatus(req, res, next);
}


function getGCodes(req, res, next) {
	fs.readdir(gCodeRoot, function(err, items){
		if(err){
			res.status(500)
				.json(err);
		} else {
			res.json(items);
		}
	});
}

function getRunStatus(req, res, next){
	res.json({
		isRunning: isRunning,
		status: runStatus
	});
}

function getSettings(req, res, next) {
	res.json(params);
}

function changeSettings(req, res, next) {
	//params.
	console.log(req.body);
	res.json('Ok');
}

router.get( "/settings", getSettings);
router.post( "/settings", changeSettings);
router.get( "/g-codes/list", getGCodes);
router.get( "/g-codes/exec/:filename", execGCode);
router.get( "/g-codes/status", getRunStatus);

router.get( "/g-codes/command/move/:distanceX/:distanceY?", move);
router.get( "/g-codes/command/togglepen/:val", togglePen);


module.exports = router;