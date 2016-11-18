module.exports = function(grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

	function processTemplate(src, filePath) {
		console.log( 'Processing template file:', filePath );

		return '<script type="text/x-template" id="' +
			filePath.replace( './src/client/', '' ).replace(/[\./\\]+/g, "-") +
			'">' +
			src +
			'</script>';
	}

	grunt.initConfig({
		vars: {
			tmp: './.tmp',
			src: {
				root: './src',
				client: "<%=vars.src.root%>/client",
				server: "<%=vars.src.root%>/server"
			},
			dist: {
				root: './dist',
				client: "<%=vars.dist.root%>/client",
				server: "<%=vars.dist.root%>/server"
			}
		},

		clean: [ "<%=vars.dist.root%>", "<%=vars.tmp%>" ],

		copy: {
			server: {
				files: [
					{ src: '<%=vars.src.root%>/index.js', dest: '<%=vars.dist.root%>/index.js' },
					{ src: '{*,**/*}.*', dest: '<%=vars.dist.server%>/', cwd: '<%=vars.src.server%>/', expand: true }
				]
			},
			css: {
				files: [
					{ src: 'css/{*,**/*}.*', dest: '<%=vars.dist.client%>/', cwd: '<%=vars.src.client%>/', expand: true }
				]
			},
			gcodes: {
				files: [
					{ src: 'library/{*,**/*}.*', dest: '<%=vars.dist.root%>/', cwd: '<%=vars.src.root%>/', expand: true }
				]
			}
		},

		
		less: {
			dev: {
				options: {
					paths: ['<%=vars.src.client%>/less']
				},
				files: {
					'<%=vars.dist.client%>/css/site.css': '<%=vars.src.client%>/less/site.less'
				}
			}
		},

		concat: {
			js: {
				options: {
					separator: ';\n',
				},
				src: [
					['<%=vars.src.client%>/js/**/*.js','!<%=vars.src.client%>/js/app.js'],
					'<%=vars.src.client%>/js/app.js'
				],
				dest: '<%=vars.dist.client%>/js/app.js'
			},

			templates: {
				options: {
					process: processTemplate
				},
				src: ['<%=vars.src.client%>/templates/{*,**/*}.*'],
				dest: '<%=vars.tmp%>/templates/index.html'
			}
		},

		includereplace: {
			dist: {
				options: {
					includesDir: "<%=vars.tmp%>",
					globals: {

					}
				},
				files: [ {
					src: "index.html",
					dest: "<%=vars.dist.client%>/",
					cwd: '<%=vars.src.client%>/',
					expand: true
				}]
			}
		},

		nodemon: {
			dev: {
				options: {
					cwd: '<%=vars.dist.root%>/',
					watch: ['<%=vars.dist.server%>/'],
					ext: 'js'
				},
				script: 'index.js'
			}
		},

		concurrent: {
			dev: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['nodemon', 'watch']
			}
		},

		watch: {
			scripts: {
				files: ['<%=vars.src.client%>/{*,**/*}.js'],
				tasks: ['concat:js'],
				options: {
					spawn: false,
				}
			},
			less: {
				files: ['<%=vars.src.client%>/{*,**/*}.{less,css}'],
				tasks: ['less', 'copy:css'],
				options: {
					spawn: false,
				}
			},
			templates: {
				files: ['<%=vars.src.client%>/{*,**/*}.html'],
				tasks: ['concat:templates', 'includereplace'],
				options: {
					spawn: false,
				}
			},

			server: {
				files: ['<%=vars.src.server%>/{*,**/*}.js'],
				tasks: ['copy:server'],
				options: {
					spawn: false,
				}
			}
		}
	});

	grunt.registerTask('default', [
		'clean',
		'copy',
		'less',
		'concat',
		'includereplace',
		'concurrent'
	]);

};