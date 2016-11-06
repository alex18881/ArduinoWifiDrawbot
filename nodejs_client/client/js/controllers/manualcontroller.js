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