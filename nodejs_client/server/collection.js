var express = require('express'),
	path = require('path'),
	router = express.Router(),
	fs = require("fs"),
	validCommands = { "G": 1, "M": 1 },
	gCodeRoot = "./g-code";

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

function loadFile(fileName) {
	console.log( "Reading file: %s", fileName );
	return new Promise( (resolve, reject) => {
		var filename = path.join( gCodeRoot, fileName);
		console.log( "Reading file: %s", filename );

		fs.readFile( filename, "utf8", (fileErr, data)=>{
			if (fileErr) {
				reject(fileErr);
			} else {
				var commands = data.replace("\r", "").split( "\n" )
					.filter( (a)=>{ return !!a.trim() && validCommands[a.charAt(0)]; } );
					
				resolve(commands);
			}
		});

	} );
}

router.get( "/list", getGCodes);

module.exports = {
	api: router,
	loadFile: loadFile
};