var express = require('express');
var bodyParser = require('body-parser');
var botService = require('./robotService.js');
var app = express();

app.use(express.static('client'));
app.use(bodyParser.json({strict: false}));
app.use('/api', botService);

app.listen(3000);
console.log('Started at 3000');