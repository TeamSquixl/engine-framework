var gulp = require('gulp');
var fb = require('gulp-fb');

var TimeOutInSeconds = 5;

gulp.task('unit-runner', function() {
    var js = paths.test.src;
    var dest = paths.test.src.split('*')[0];
    return gulp.src(js, { read: false, base: './' })
        .pipe(fb.toFileList())
        .pipe(fb.generateRunner(paths.test.runner,
            dest,
            'Engine Framework Test Suite',
            paths.test.lib_min,
            paths.test.lib_dev,
            []))
        .pipe(gulp.dest(dest))
        ;
});

function test () {
    var qunit;
    try {
        qunit = require('gulp-qunit');
    }
    catch (e) {
        console.error('Please run "npm install gulp-qunit" before running "gulp test".');
        throw e;
    }
    return gulp.src('qunit/unit/runner.html', { read: false })
        .pipe(qunit({ timeout: TimeOutInSeconds }));
}

gulp.task('test', ['build-test', 'unit-runner'], test);
gulp.task('rerun-test', test);
