angular.module('WifiDrawBotConsole').service('api', [
	'$http',
	function ($http) {

		function getStatus() {
			return $http.get('/api/bot/status');
		}

		function connect() {
			return $http.post('/api/bot/connect', {});
		}

		function disconnect() {
			return $http.post('/api/bot/disconnect', {});
		}

		return {
			getStatus: getStatus,
			connect: connect,
			disconnect: disconnect
		}
	}
]);