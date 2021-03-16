var config = require('../config');
var gulp = require('gulp');
var series = require('stream-series');
var gutil = require('gulp-util');
var del = require('del');
exports.task = function() {
    var streams = [];

    gutil.log("处理项目的Asset的资源文件.......");

    del.sync(config.outputDir+'/assets');

    streams.push(
        gulp.src(config.assetFiles)
            .pipe(gulp.dest(config.outputDir+'/assets'))
    );

    return series(streams);

};
