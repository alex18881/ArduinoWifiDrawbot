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

	return {
		getCollection: getCollection,
		execFile: execFile,
		move : move,
		getStatus: getStatus,
		connect: connect,
		disconnect: disconnect
	}
} (axios);