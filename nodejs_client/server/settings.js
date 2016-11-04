var express = require('express'),
	settings = {
		host: '192.168.1.9',
		port: 1336,
		shellPrompt: '>',
		timeout: 30000
	},
	router = express.Router();

module.exports = {
	settings: settings,
	api: router
};