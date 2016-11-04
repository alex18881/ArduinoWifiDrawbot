angular.module('WifiDrawBotConsole', ['ngRoute', 'route-segment', 'view-segment'])
.config(function($routeSegmentProvider){

	$routeSegmentProvider
		.when('/', 'collection')
		.when('/collection', 'collection')
		.when('/manual', 'manual')
		.when('/settings', 'settings')

	.segment('collection', { controller: 'GCodeListController', templateUrl: 'templates/collection/list.tpl.html' })
	.segment('manual', { controller: 'ManualController', templateUrl: 'templates/manual/move.tpl.html' })
	.segment('settings', { controller: 'SettingsController', templateUrl: 'templates/settings/connection.tpl.html' });
	

});