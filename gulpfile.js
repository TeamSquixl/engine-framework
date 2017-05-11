var gulp = require('gulp');
var requireDir = require('require-dir');

// specify game project paths for tasks.
global.paths = {
    src: './src',
    jsEntry: './build-entry',
    outDir: './bin',
    outFile: 'engine-framework.js',

    test: {
        src: 'qunit/unit/**/*.js',
        runner: 'qunit/lib/runner.html',
        lib_dev: [
            'bin/engine-framework.test.dev.js',
        ],
        lib_min: [
            'bin/engine-framework.test.min.js',
        ]
    },

    get scripts() { return this.src + '/**/*.js'; },
};

// require all tasks in gulp/tasks, including sub-folders
requireDir('./gulp/tasks', { recurse: true });

// default task
gulp.task('default', ['jshint', 'build']);
