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

		return {
			move : move,
			getStatus: getStatus,
			connect: connect,
			disconnect: disconnect
		}
	}
]);