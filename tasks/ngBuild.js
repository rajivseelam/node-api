var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var config = appRequire('config');
var streamqueue = require('streamqueue');
var notify = require('gulp-notify');

module.exports = function (gulp) {
    var args = process.argv.slice(3);
    var watch = false;

    if (args[0] !== '-a') {
        console.log('Usage : gulp ng:build -a <app-folder-in-public-dir>');
        return;
    }

    if (args[1] === undefined) {
        console.log('Usage : gulp ng:build -a <app-folder-in-public-dir>');
        return;
    }

    if (args[2] === '-w') {
        watch = true;
    }

    var appDir = config.path('/public/'+args[1]);

    function build() {
        /**
         * concat app scripts
         */
        streamqueue(
            {objectMode: true},
            gulp.src(appDir+'/app/main.js'),
            gulp.src(appDir+'/templates/**/*.html').pipe(templateCache({module: 'app'})),
            gulp.src([appDir+'/app/**/*.js', '!'+appDir+'/app/main.js'])
        ).pipe(concat('app.js'))
         .pipe(gulp.dest(appDir))
         .pipe(notify('Build Complete!'));
    }

    if (watch) {
        build();
        gulp.watch([
            appDir+'/app/**/*.js',
            appDir+'/templates/**/*.html'
        ], build);
    } else {
        build();
    }
}