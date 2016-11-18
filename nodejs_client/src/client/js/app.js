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