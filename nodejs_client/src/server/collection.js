var express = require('express'),
	gcode2svg = require("gcode2svg"),
	path = require('path'),
	router = express.Router(),
	fs = require("fs").promises,
	validCommands = { "G": 1, "M": 1 },
	libraryRoot = "./library",
	//gcanvas = require('gcanvas'),
	//canvg = require('canvg'),

	libIndex = path.join(libraryRoot, 'db.json'),
	multer  = require('multer');

function readFile( fileName ) {
	return fs.readFile(path.join(libraryRoot, fileName), 'utf8')
		.then( function (fileContent) {
			return {
				fileName: fileName,
				content: fileContent
			};
		} );
}

function readIndex() {
	return fs.readFile( libIndex, 'utf8' )
		.then((content) => {
			return JSON.parse(content);
		})
}

function getGCodes(req, res, next) {
	readIndex()
		.then((indexJson) => {
			res.json(indexJson);
		})
		.catch( (err) => {
			console.warn(err);
			res.json([]);
		} );
}

function loadFile(fileName) {
	console.log( "Reading file: %s", fileName );

	return readIndex()
		.then((indexJson) => {
			return (indexJson.filter( (a) => {return a.fileName == fileName;} )[0] || {}).gcode || '';
		})
		.then( commands => {
			return commands.replace("\r", "").split( "\n" )
				.filter( (a)=>{ return !!a.trim() && validCommands[a.charAt(0)]; } );
		} );
}

function saveFile(req, res, next) {
	//console.log( req.file );
	readIndex()
		.then((indexJson) => {
			var filename = path.parse(req.file.originalname).name,
				content = req.file.buffer.toString('utf8');

			indexJson.push({
				'name': filename,
				'svg': gcode2svg(content),
				'gcode': content
			});
			return fs.writeFile(libIndex, JSON.stringify(indexJson), 'utf8' );
		})
		.then( () => {res.json('Ok');} )
		.catch( (e) => {res.code(500).json('Ok');} );
}

function removeItem(req, res, next) {
	readIndex()
		.then((indexJson) => {
			var modelName = req.body.model;
			indexJson = indexJson.filter( (a) => { return a.name != modelName; } );
			return fs.writeFile(libIndex, JSON.stringify(indexJson), 'utf8' );
		})
		.then( () => {res.json('Ok');} )
		.catch( (e) => {res.code(500).json('Ok');} );
}

function sliceItem( req, res, next ) {
	readIndex()
		.then((indexJson) => {
			var modelName = req.body.model;
			indexJson = indexJson.find( (a) => { return a.name != modelName; } );

			if (indexJson) {
				var canvas = new Canvas();
 				indexJson.gcode = canvg(canvas, indexJson.svg);
 			}
 			return fs.writeFile(libIndex, JSON.stringify(indexJson), 'utf8' );
		})
		.then( () => {res.json('Ok');} )
		.catch( (e) => {res.code(500).json('Ok');} );
}

router.get( "/list", getGCodes);
router.post( "/add", multer().single('file'), saveFile);
router.post( "/remove", removeItem);
router.post( "/slice", sliceItem );


module.exports = {
	api: router,
	loadFile: loadFile
};