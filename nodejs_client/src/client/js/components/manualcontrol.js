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
});