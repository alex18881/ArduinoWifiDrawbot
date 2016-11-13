var express = require('express');
var bodyParser = require('body-parser');
var api = require('./server/api.js');
var app = express();

app.use(function(req, res, next) {
	console.log( new Date(), req.method, req.url );
	next();
});
app.use(express.static('./client'));
app.use(bodyParser.json({strict: false}));
app.use('/api', api);

app.listen(3000);
console.log('Started at 3000');