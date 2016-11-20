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
});