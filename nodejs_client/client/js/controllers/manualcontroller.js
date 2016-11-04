angular.module('WifiDrawBotConsole').controller('ManualController', [
	'$scope',
	function($scope) {

		$scope.move = function ($evt, axis, distance) {
			var url = '/api/g-codes/command/move/';
			if( axis == 'x' ){
				url += distance;
			}else {
				url += '0/' + distance;
			}
			$http.get(url)
				.success(setRunStatus)
				.error(errHandler);
		}	

	}
]);