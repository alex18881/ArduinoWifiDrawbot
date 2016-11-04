angular.module('WifiDrawBotConsole', ['ngRoute', 'route-segment', 'view-segment'])
.config(function($routeSegmentProvider){

	$routeSegmentProvider
		.when('/', 'manual')
		.when('/manual', 'manual')
		.when('/collection', 'collection')
		.when('/settings', 'settings')

	.segment('manual', { controller: 'ManualController', templateUrl: 'templates/manual/move.tpl.html' })
	.segment('collection', { controller: 'GCodeListController', templateUrl: 'templates/collection/list.tpl.html' })
	.segment('settings', { controller: 'SettingsController', templateUrl: 'templates/settings/connection.tpl.html' });
});