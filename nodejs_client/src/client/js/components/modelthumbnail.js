Vue.component('model-thumbnail', {
	props: ['svg'],

	template: '<img :src="dataUrl" />',

	computed: {
		dataUrl: function() {
			return this.svg ? 'data:image/svg+xml;base64,' + btoa( unescape( encodeURIComponent((this.svg + '').trim().replace(/[\s\n\r]+/g, ' ')) ) ) : '';
		}
	}
});