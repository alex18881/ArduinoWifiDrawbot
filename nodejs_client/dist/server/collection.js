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

function getGCodes(req, res, next) {
	fsAaccess(libraryRoot, fs.constants.R_OK | fs.constants.W_OK)
		.then(function(){
			return fsReaddir(libraryRoot);
		})
		.then( function (items) {
			var promises = [];
			items.forEach(function(item){
				promises.push(readFile(item));
			});
			return Promise.all(promises);
		} )
		.then( function (items) {
			res.json(items);
			next();
		})
		.catch(function(err){
			console.warn(err);
			res.json([]);
		});
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
	var filename = path.join( libraryRoot, req.file.originalname);
	fsSaveFile(filename, req.file.buffer)
		.then( () => {res.json('Ok');} )
		.catch( (e) => {res.code(500).json('Ok');} );
}

router.get( "/list", getGCodes);
router.post( "/add", multer().single('file'), saveFile);

module.exports = {
	api: router,
	loadFile: loadFile
};