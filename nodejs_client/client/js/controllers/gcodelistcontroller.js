angular.module('WifiDrawBotConsole').controller('GCodeListController', [
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
]);