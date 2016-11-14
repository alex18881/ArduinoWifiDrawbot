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
]);*/