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
});