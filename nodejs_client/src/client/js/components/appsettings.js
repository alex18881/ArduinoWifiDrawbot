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
*/