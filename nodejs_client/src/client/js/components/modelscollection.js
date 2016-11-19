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
				addSvg: addSvg
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
});