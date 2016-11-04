angular.module('WifiDrawBotConsole').controller('ManualController', [
	'$scope', 'api', 'notifyError',
	function($scope, api, notifyError) {

		$scope.move = function ($evt, axis, distance) {
			var url = '/api/bot/move/';
			if( axis == 'x' ){
				url += distance;
			}else {
				url += '0/' + distance;
			}
			$http.get(url)
				.success(setRunStatus)
				.error(errHandler);
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