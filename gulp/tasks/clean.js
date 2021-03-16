var config = require('../config');
var gulp = require('gulp');
var series = require('stream-series');
var gutil = require('gulp-util');
var gulpClean = require('gulp-clean');
exports.task = function() {
    var streams = [];

    gutil.log("clear项目资源.......");

    streams.push(
        gulp.src(config.outputDir,{read: false})
            .pipe(gulpClean(null))
    );

    return series(streams);

};
