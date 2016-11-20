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
} (axios);