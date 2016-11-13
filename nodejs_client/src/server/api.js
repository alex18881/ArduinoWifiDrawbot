var express = require('express'),
	router = express.Router(),

	settings = require('./settings.js'),
	collection = require('./collection.js'),
	robot = require('./robot.js')(settings.settings, collection);

router.use('/bot', robot.api);
router.use('/collection', collection.api);
router.use('/settings', settings.api);

module.exports = router;