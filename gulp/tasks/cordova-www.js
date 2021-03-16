var config = require('../config');
var gulp = require('gulp');
var series = require('stream-series');
var gutil = require('gulp-util');
var del = require('del');
exports.task = function () {
    var streams = [];

    gutil.log("开始处理cordova的www文件夹.......");

    streams.push(
        gulp.src(['www/**/*','!www/index.html'])
            .pipe(gulp.dest('cordova/www/'))
    );

    return series(streams);

};
