angular.module('WifiDrawBotConsole').controller('GCodeListController', [
	'$scope', '$http',
	function ($scope, $http) {

		function mapItems(item) {
			return {
				fileName: item,
				status: ''
			}
		}

		function checkStatus(data) {
			$scope.activeItem.status = data.status;

			if( data.isRunning ) {
				$http.get('/api/g-codes/status')
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

		$http.get('/api/collection/list')
			.success(renderList)
			.error(errHandler);


		$scope.runScript = function(evt, item) {
			evt.preventDefault();

			$scope.error = null;
			$scope.activeItem = item;

			$http.get('/api/g-codes/exec/' + item.fileName)
				.success(setRunStatus)
				.error(errHandler);
		}
	}
]);