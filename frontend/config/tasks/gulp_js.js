/**
 * Tarea para compilar y validar archivos .coffee
 *
 * @module Task (gulp js)
 * @extends Gulp
 * @extends Path
 * @extends Config
 * @extends Plugins
 * @extends Functions
 * @author Victor Sandoval
 */

function Task(gulp, path, config, plugins, functions){

	var pathCoffeeFiles = [
		path.frontend.coffee + '/libs/*.coffee',
		path.frontend.coffee + '/libs/**/*.coffee'
	]

	/**
	 * Tarea para compilar archivos (.coffee) de librerías usadas para el proyecto
	 * (gulp coffee)
	 */
	gulp.task('coffee', function() {
		return gulp.src(pathCoffeeFiles, { base : path.frontend.coffee })
		.pipe(plugins.coffee({bare: true}).on('error', functions.errorHandler))
		.pipe(gulp.dest(path.dest.js));
	});

	/**
	 * Tarea para compilar archivos (.coffee) de los modulos del proyecto
	 * (gulp js:concat)
	 */
	gulp.task('js:concat', function(){
		gulp.src(path.frontend.coffee + '/modules/**/*.coffee')
			.pipe(plugins.recursiveConcat({ extname: '.coffee' }))
			.pipe(plugins.coffee({ bare: true }))
			.pipe(plugins.if(config.prod, plugins.uglify({
				mangle 	: false, 
				compress: {
					drop_debugger: true
				}
			})))
			.pipe(gulp.dest(path.dest.js + '/modules'));
	});

	/**
	 * Tarea para validar variables no usadas en los modulos js
	 * (gulp js:lint)
	 */
	gulp.task('js:lint', function() {
		return gulp.src(path.dest.js + '/modules/**/*.js')
			.pipe(plugins.jshint(path.frontend.config + '/.jshintrc'))
			.pipe(plugins.jshint.reporter('jshint-stylish'))
			.pipe(plugins.jshint.reporter('fail'))
			.on('error', functions.errorHandler)
			.on('end', functions.successHandler);
	});

	/**
	 * Tarea para validar complejidad de código en los modulos js
	 * (gulp js:complexity)
	 */
	gulp.task('js:complexity', function(){
		gulp.src(path.frontend.coffee + '/modules/**/*.coffee')
			.pipe(plugins.coffee({ bare: true }))
			.pipe(plugins.complexity());
	});

	/**
	 * Tarea principal
	 * (gulp js:all)
	 */
	gulp.task('js:all', function(callback) {
		plugins.runSequence('clean:js', 'coffee', 'js:concat', 'js:lint', 'copy:js:libs', callback);
	});

	/**
	 * Tarea usada por el gulp watch
	 * (gulp js)
	 */
	gulp.task('js', function(callback) {
		plugins.runSequence('coffee', 'js:concat', 'js:lint', callback);
	});
}

module.exports = Task;