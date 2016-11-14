Vue.component('app-settings', {
	template: '#templates-settings-connection-tpl-html'
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
*/;
Vue.component('main-header', {
	template: '#templates-common-header-tpl-html'
});;
Vue.component('manual-control', function (resolve, reject) {

	function errHandler(err){
		model.loading = false;
		return err;
		//notifyError(err);
	}

	function setStatus(data) {
		model.loading = false;
		model.status = data.data;
		return data.data;
	}

	function load() {
		model.loading = true;
		return api.getStatus()
				.then(setStatus)
				.catch(errHandler);
	}

	var model = {
			loading: false,
			status: {
				connected: false,
				machineType: '',
				version: ''
			},
			distance: 100
		},
		component = {
			template: '#templates-manual-move-tpl-html',
			data: function () {
				return model;
			},

			computed: {
				connectedText: function () {
					return this.status.connected ? 'Connected' : 'Disconnected';
				},
				machineType: function () {
					return this.status.machineType || '-';
				},
				version: function () {
					return this.status.version || '-';
				},
				fwCodeName: function () {
					return this.status.fwCodeName || '-';
				}
			},

			methods: {
				moveHome: function () {
					api.move(0, 0)
						.then(load)
						.catch(errHandler);
				},
				move: function (axis, distance) {
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
				},
				connect: function() {
					this.loading = true;
					api.connect()
						.then(load)
						.catch(errHandler);
				},
				disconnect: function() {
					this.loading = true;
					api.disconnect()
						.then(load)
						.catch(errHandler);
				}
			}
		};

	load()
		.then(function(){
			resolve(component);
		})
		.catch(reject);
});;
Vue.component('models-collection', function(resolve, reject){
	
	var model = {
			error: null,
			activeItem: null,
			items: []
		},

		component = {
			template: '#templates-collection-list-tpl-html',
			data: function () {
				return model;
			}
		};

	function mapItems(item) {
		return {
			fileName: item,
			status: ''
		}
	}

	function errHandler(err){
		model.error = err;
		model.activeItem = null;
		reject();
	}
	
	function renderList(data) {
		model.items = data.data.map(mapItems);
		resolve(component);
	}

	api.getCollection()
		.then(renderList)
		.catch(errHandler);
});


/*angular.module('WifiDrawBotConsole').controller('GCodeListController', [
	'$scope', 'api',
	function ($scope, api) {

		

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




		$scope.runScript = function(evt, item) {
			evt.preventDefault();

			$scope.error = null;
			$scope.activeItem = item;

			api.execFile(item.fileName)
				.success(setRunStatus)
				.error(errHandler);
		}
	}
]);*/;
var api = function ($http) {

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
} (axios);;
/*
angular.module('WifiDrawBotConsole').value('notifyError', function (err) {
	var toast = $('<div class="snackbar toast snackbar-opened"></div>').appendTo('.snackbar-container');
	toast.html(JSON.stringify(err));
	window.setTimeout(function (){
		toast.remove();
	}, 5000);
});

*/;
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
(function (){
	new Vue({
		el: '.app-container',
		router: new VueRouter({
			routes: [
				{
					path: '/',
					redirect: '/manual'
				},
				{ 
					name: 'manual',
					path: '/manual',
					component: 'manual-control'
				},
				{
					name: 'collection',
					path: '/collection',
					component: 'models-collection'
				},
				{
					name: 'settings',
					path: '/settings',
					component: 'app-settings'
				}
			]
		})
	});
})();