module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		ts: {
			options: {
				comments: false,               // same as !removeComments. [true | false (default)]
				target: 'es5',                 // target javascript language. [es3 | es5 (grunt-ts default) | es6]
				module: 'commonjs',                 // target javascript module style. [amd (default) | commonjs]
				declaration: true            // generate a declaration .d.ts file for every output js file. [true | false (default)]
			},
			build: {
				src: ['src/index.ts'],
				out: './dist/axios.js'
			}
		},
		uglify: {
			min: {
				files: {'dist/axios.min.js': ['dist/axios.js']}
			}
		}
	});

	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build', ['ts:build', 'uglify:min']);
};
