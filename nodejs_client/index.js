var telnet = require('telnet-client'),
	fs = require("fs");

var connection = new telnet(),
	validCommands = { "G": 1, "M": 1 },
	params = {
		host: '192.168.1.9',
		port: 1336,
		shellPrompt: '>',
		timeout: 1500
	};

function exec( cmds ){
	if(!cmds.length){
		return Promise.resolve(cmds);
	}

	var cmd = cmds.shift();
	
	console.log( cmds.length + ">" + cmd );

	return connection.exec(cmd)
		.then(
			(pr) => {
				console.log( "OK: " + pr );
				return exec(cmds);
			},
			(err) => { throw err; }
		);
}

console.log( "Reading file: %s", process.argv[2] );

fs.readFile( process.argv[2], "utf8", (err, data)=>{
	// body...
	if (err) return console.error( err );

	var commands = data.replace("\r", "").split( "\n" )
		.filter( (a)=>{ return !!a.trim() && validCommands[a.charAt(0)]; } )

	console.log( "Executing %s commands", commands.length );

	connection.connect(params)
		.then(
			(prompt) => {
				console.log( "Connected: " + prompt );
	  			return exec( commands );
			},
			(error) => {
	  			console.error('promises reject:', error)
			}
		).then(
			()=> {
				console.log( "DONE!" );
				return connection.destroy();
			},
			(e)=>{ throw e; }
		).then(
			()=>{ process.exit(0); },
			(err)=> { console.error( err ); process.exit(err.number); }
		);
} );





