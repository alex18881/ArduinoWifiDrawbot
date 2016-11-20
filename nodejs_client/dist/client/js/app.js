Vue.component('main-header', {
	template: '#templates-common-header-tpl-html',
	data: function(){
		return {
			menuOpen: false
		}
	},

	methods: {
		toggleMenu: function() {
			this.menuOpen = !this.menuOpen;
		}
	}
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
			items: [],
			uploads: {}
		},
		count = 0,

		component = {
			template: '#templates-collection-list-tpl-html',
			data: function () {
				return model;
			},
			methods: {
				printModel: printModel,
				addSvg: addSvg,
				removeModel: removeModel
			}
		};


	function updateProgress(id, value) {
		if(model.uploads[id]){
			Vue.set(model.uploads[id], 'progress', value);
		}
	}

	function showProgress(file){
		var uploadId = 'modelUpload' + count++;

		Vue.set(model.uploads, uploadId, {
			fileName: file.name,
			progress: 0
		});

		return {
			id: uploadId,
			file: file,
			onProgress: updateProgress
		};
	}

	function uploadDone(uploadInfo){
		if(uploadInfo.id && model.uploads[uploadInfo.id]) {
			Vue.delete(model.uploads, uploadInfo.id);
			uploadInfo.svg = '<svg></svg>';
			Vue.set(model.items, model.items.length, mapItems(uploadInfo));
		}
	}

	function uploadFile(file) {
		return Promise.resolve(file)
			.then(showProgress)
			.then(api.uploadModel)
			.then(uploadDone);
	}

	function addSvg(files) {
		Promise.all(files.map(uploadFile))
			.then(api.getCollection)
			.then(renderList)
			.catch(errHandler);
	}

	function removeModel(item) {
		Vue.set(model, 'items', model.items.filter( (a) => { return a !== item; } ));
		
		Promise.resolve(item)
			.then(api.removeModel)
			.then(api.getCollection)
			.then(renderList)
			.catch(errHandler);
	}

	function checkStatus(data) {
		model.activeItem.status = data.status;

		if( data.isRunning ) {
			api.getExecStatus()
				.then(checkStatus)
				.catch(errHandler);
		}
	}

	function setRunStatus(data) {
		if(data.error){
			errHandler(data);
		} else if(model.activeItem) {
			checkStatus(data);
		} else {
			model.error = 'not selected';
		}
	}

	function printModel(item){
		model.error = null;
		model.activeItem = item;

		api.execFile(item.fileName)
			.then(setRunStatus)
			.catch(errHandler);
	}

	function mapItems(item) {
		return {
			svg: item.svg,
			name: item.name,
			status: ''
		}
	}

	function errHandler(err){
		model.error = err;
		model.activeItem = null;
	}
	
	function renderList(data) {
		Vue.set(model, 'items', data.data.map(mapItems));
	}

	function resolveComponent() {
		resolve(component)
	}

	api.getCollection()
		.then(renderList)
		.then(resolveComponent)
		.catch(errHandler);
});;
Vue.component('model-card', {
	template: '#templates-collection-item-tpl-html',

	props: ['model'],

	data: function() {
		return {
			menuOpen: false
		}
	},

	methods: {
		openMenu: function () {
			this.menuOpen = true;
		},

		closeMenu: function () {
			this.menuOpen = false;
		},

		printModel: function(){
			this.closeMenu();
			this.$emit('model-print');
		},

		deleteModel: function () {
			this.closeMenu();
			this.$emit('model-remove');
		}
	},

	computed: {
		dataUrl: function() {
			return this.model.svg ? 'data:image/svg+xml;base64,' + btoa( unescape( encodeURIComponent((this.model.svg + '').trim().replace(/[\s\n\r]+/g, ' ')) ) ) : '';
		}
	}
});;
Vue.component('page-control', {
	template: '<router-view></router-view>'
});;
Vue.component('app-settings', {
	template: '#templates-settings-index-tpl-html',
	computed: {
		test: function(){
			console.log('App settings');
			return 'TEST';
		}
	}
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
Vue.component('connection-settings', {
	template: '#templates-settings-connection-tpl-html'
});;
Vue.component('eeprom-settings', {
	template: '#templates-settings-eeprom-tpl-html'
});;
Vue.component('file-upload', {
	template: '<span>\
		<input type="file" :accept="filter" @change="selectFile" :multiple="isMultiple" style="display: none;">\
		<a href="#upload-file" :class="cssClass" @click.prevent="openFileDialog"><slot></slot></a>\
	</span>',
	props: {
		cssClass: String,
		filter: String,
		isMultiple: {
			type: Boolean,
			default: false,
			required: true
		}
	},
	methods: {
		openFileDialog: function(){
			this.fileInput.click();
		},
		selectFile: function() {
			var files = this.fileInput.files;
			this.$emit('file-selected', ([]).slice.call(files));
		}
	},
	computed: {
		fileInput: function(){
			return this.$el.querySelector('input[type=file]');
		}
	}
});;
Vue.component('modal-progress', {
	template: '#templates-common-modalprogress-tpl-html',
	props: ['files']
});;
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

	function uploadModel(fileInfo) {
		var uploadId = fileInfo.id,
			fileName = fileInfo.file.name,
			data = new FormData();

		data.append('file', fileInfo.file);

		return $http.post(
			'/api/collection/add',
			data,
			{
				onUploadProgress: function(evt) {
					fileInfo.onProgress(uploadId, evt.loaded / evt.total);
				}
			}
		).then(function(){
			return {
				id: uploadId,
				fileName: fileName
			};
		});
	}

	function removeModel(model) {
		return $http.post('/api/collection/remove', {model: model.name});
	}

	return {
		getCollection: getCollection,
		execFile: execFile,
		move : move,
		getStatus: getStatus,
		connect: connect,
		disconnect: disconnect,
		uploadModel: uploadModel,
		removeModel: removeModel
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
(function (){
	new Vue({
		el: '.app-container',
		router: new VueRouter({
			routes: [
				{
					path: '/',
					redirect: 'manual',
					components: {
						header: Vue.component('main-header'),
						default: Vue.component('page-control')
					},
					children: [
						{ 
							name: 'manual',
							path: 'manual',
							component: Vue.component('manual-control')
						},
						{
							name: 'collection',
							path: 'collection',
							component: Vue.component('models-collection')
						},
						{
							name: 'settings',
							path: 'settings',
							component: Vue.component('app-settings'),
							redirect: {name:'connection'},
							children: [
								{
									name: 'eeprom',
									path: 'eeprom',
									component: Vue.component('eeprom-settings')
								},
								{
									name: 'connection',
									path: 'connection',
									component: Vue.component('connection-settings')
								}
							]
						}
					]
				}
			]
		})
	});
})();