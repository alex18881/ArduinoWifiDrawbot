/*angular.module('WifiDrawBotConsole', ['ngRoute', 'route-segment', 'view-segment'])
.config(function($routeSegmentProvider){

	$routeSegmentProvider
		.when('/', 'manual')
		.when('/manual', 'manual')
		.when('/collection', 'collection')
		.when('/settings', 'settings')

	.segment('manual', { controller: 'ManualController', templateUrl: 'templates/manual/move.tpl.html' })
	.segment('collection', { controller: 'GCodeListController', templateUrl: 'templates/collection/list.tpl.html' })
	.segment('settings', { controller: 'SettingsController', templateUrl: 'templates/settings/connection.tpl.html' });
});*/

new Vue({
	el: '.app-container',
	router: new VueRouter({
		routes: [
			{ path: '/', component: manualControl, alias: '/manual' },
			{ path: '/collection', component: modelsCollection },
			{ path: '/settings', component: appSettings },
		]
	})
});
Vue.component('modelsCollection',  {
	
});
/*angular.module('WifiDrawBotConsole').controller('GCodeListController', [
	'$scope', 'api',
	function ($scope, api) {

		function mapItems(item) {
			return {
				fileName: item,
				status: ''
			}
		}

		function checkStatus(data) {
			$scope.activeItem.status = data.status;

			if( data.isRunning ) {
				api.getExecStatus()
					.success(checkStatus)
					.error(errHandler);
			}
		}

		function setRunStatus(data) {
			if(data.error){
				errHandler(data);
			} else if($scope.activeItem) {
				checkStatus(data);
			} else {
				$scope.error = { message: 'not selected' };
			}
		}

		function errHandler(err){
			$scope.error = err;
			$scope.activeItem = null;
		}
		function renderList(data) {
			$scope.items = data.map(mapItems);
		}

		api.getCollection()
			.success(renderList)
			.error(errHandler);


		$scope.runScript = function(evt, item) {
			evt.preventDefault();

			$scope.error = null;
			$scope.activeItem = item;

			api.execFile(item.fileName)
				.success(setRunStatus)
				.error(errHandler);
		}
	}
]);*/
var mainHeader = {
	tempalte: '#main-header'
};
/*
angular.module('WifiDrawBotConsole').controller('MainNavController', [
	'$scope', '$http',
	function ($scope, $http) {

	}
]);
*/
Vue.component('manualControl',  {
	
});
/*
angular.module('WifiDrawBotConsole').controller('ManualController', [
	'$scope', 'api', 'notifyError',
	function($scope, api, notifyError) {
		$scope.distance = 100;

		$scope.moveHome = function () {
			api.move(0, 0)
				.then(load)
				.catch(errHandler);
		};

		$scope.move = function (axis, distance) {
			var x = 0,
				y = 0;
			if( axis == 'x' ){
				x = distance;
			}else {
				y = distance;
			}
			api.move(x, y)
				.then(load)
				.catch(errHandler);
		}

		function errHandler(err){
			$scope.loading = false;
			notifyError(err);
		}

		function setStatus(data) {
			$scope.loading = false;
			$scope.status = data.data;
		}

		function load() {
			$scope.loading = true;
			api.getStatus()
				.then(setStatus)
				.catch(errHandler);
		}

		$scope.connect = function() {
			$scope.loading = true;
			api.connect()
				.then(load)
				.catch(errHandler);
		};

		$scope.disconnect = function() {
			$scope.loading = true;
			api.disconnect()
				.then(load)
				.catch(errHandler);
		};

		load();
	}
]);
*/
Vue.component('app-settings',  {
	
});
/*
angular.module('WifiDrawBotConsole').controller('SettingsController', [
	'$scope',
	function($scope) {
		$scope.openSettings = function(evt){
			evt.preventDefault();
			$http.get('/api/settings')
				.success(function(data){
					$scope.settings = data;
				})
				.error(errHandler);
		}

		$scope.saveSettings = function(evt) {
			evt.preventDefault();
			$http.post('/api/settings', $scope.settings)
				.success(function(data){
					$scope.settings = null;
				})
				.error(errHandler);
		}
	}

]);
*/
angular.module('WifiDrawBotConsole').service('api', [
	'$http',
	function ($http) {

		function getStatus() {
			return $http.get('/api/bot/status');
		}

		function move(x, y) {
			return $http.get('/api/bot/move/' + x + '/' + y);
		}

		function connect() {
			return $http.post('/api/bot/connect', {});
		}

		function disconnect() {
			return $http.post('/api/bot/disconnect', {});
		}

		function execFile(fileName) {
			return $http.post('/api/bot/exec', {filename: fileName});
		}

		function getCollection() {
			return $http.get('/api/collection/list');
		}

		return {
			getCollection: getCollection,
			execFile: execFile,
			move : move,
			getStatus: getStatus,
			connect: connect,
			disconnect: disconnect
		}
	}
]);
angular.module('WifiDrawBotConsole').value('notifyError', function (err) {
	var toast = $('<div class="snackbar toast snackbar-opened"></div>').appendTo('.snackbar-container');
	toast.html(JSON.stringify(err));
	window.setTimeout(function (){
		toast.remove();
	}, 5000);
});