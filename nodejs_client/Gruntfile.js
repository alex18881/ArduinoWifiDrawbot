module.exports = function(grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

	var path = require('path'),
		fs = require('fs'),
		createSvg = require('gcode2svg'),
		validCodes = {
			'G': 1,
			'M': 1
		};

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
			tmp: '.tmp',
			npm_root: 'node_modules',
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
			}
		},

		
		less: {
			dev: {
				options: {
					paths: [
						'<%=vars.src.client%>/less',
						'<%=vars.npm_root%>'
					]
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
					'<%=vars.npm_root%>/axios/dist/axios.js',
					'<%=vars.npm_root%>/vue/dist/vue.js',
					'<%=vars.npm_root%>/vue-router/dist/vue-router.js',
					
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
			},

			gcodes: {
				options: {
					banner: '[',
					separator: ',\n',
					footer: ']',
					process: function (content, srcpath) {
						var pathParts = path.parse(srcpath),
							gcode = pathParts.ext.slice(-2) == 'gc' ? content : '',
							svg = pathParts.ext.slice(-3) == 'svg' ? content : 
								gcode ? createSvg(gcode) : '',
							libJSON = {
								'name': pathParts.name,
								'fileName': pathParts.base,
								'svg': svg,
								'gcode': gcode
							};
						console.log('Adding file to library: ', pathParts.name);
						return JSON.stringify(libJSON);
					},
				},

				src: ['<%=vars.src.root%>/library/{*,**/*}.*'],
				dest: '<%=vars.dist.root%>/library/db.json'
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