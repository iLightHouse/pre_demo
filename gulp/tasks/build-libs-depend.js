var config = require('../config');
var gulp = require('gulp');
var series = require('stream-series');
var gutil = require('gulp-util');
var del = require('del');
var IS_RELEASE = require('../const').IS_RELEASE;
exports.task = function () {
    var streams = [];

    gutil.log("处理依赖的库文件.......");
    function getLibsSrc() {
        if (IS_RELEASE) {
            return config.libsFiles.minLib;
        } else {
            return config.libsFiles.sourceLib;
        }
    }

    del.sync(config.outputDir + '/libs');

    streams.push(
        gulp.src(getLibsSrc())
            .pipe(gulp.dest(config.outputDir + '/libs'))
    );

    return series(streams);

};
