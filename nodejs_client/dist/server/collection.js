var express = require('express'),
	promisify = require("es6-promisify"),
	path = require('path'),
	router = express.Router(),
	fs = require("fs"),
	fsAaccess = promisify(fs.access),
	fsReaddir = promisify(fs.readdir),
	fsReadFile = promisify(fs.readFile),
	fsSaveFile = promisify(fs.writeFile),
	validCommands = { "G": 1, "M": 1 },
	libraryRoot = "./library",
	libIndex = path.join(libraryRoot, 'db.json'),
	multer  = require('multer');

function readFile( fileName ) {
	return fsReadFile(path.join(libraryRoot, fileName), 'utf8')
		.then( function (fileContent) {
			return {
				fileName: fileName,
				content: fileContent
			};
		} );
}

function readIndex() {
	return fsReadFile( libIndex, 'utf8' )
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
	return new Promise( (resolve, reject) => {
		var filename = path.join( libraryRoot, fileName);
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

function saveFile(req, res, next) {
	//console.log( req.file );
	readIndex()
		.then((indexJson) => {
			var filename = path.parse( libraryRoot, req.file.originalname).name,
				content = req.file.buffer.toString('utf8');

			indexJson.push({
				'name': filename,
				'svg': content,
				'gcode': ''
			});
			return fsSaveFile(libIndex, JSON.stringify(indexJson), 'utf8' );
		})
		.then( () => {res.json('Ok');} )
		.catch( (e) => {res.code(500).json('Ok');} );
}

function removeItem(req, res, next) {
	readIndex()
		.then((indexJson) => {
			var modelName = req.body.model;
			indexJson = indexJson.filter( (a) => { return a.name != modelName; } );
			return fsSaveFile(libIndex, JSON.stringify(indexJson), 'utf8' );
		})
		.then( () => {res.json('Ok');} )
		.catch( (e) => {res.code(500).json('Ok');} );
}

router.get( "/list", getGCodes);
router.post( "/add", multer().single('file'), saveFile);
router.post( "/remove", removeItem);


module.exports = {
	api: router,
	loadFile: loadFile
};