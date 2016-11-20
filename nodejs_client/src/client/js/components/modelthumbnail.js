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
});