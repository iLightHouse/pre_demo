var config = require('../config');
var gulp = require('gulp');
var gUtil = require('gulp-util');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var series = require('stream-series');
var util = require('../util');
var gulpIf = require('gulp-if');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var IS_RELEASE = require('../const').IS_RELEASE;
exports.task = function() {
    var streams = [];

    gUtil.log("编译JS文件...");


    //生成总体的JS文件

    streams.push(
        gulp.src(config.jsSrcFiles)
            .pipe(util.filterNonCodeFiles())
            .pipe(ngAnnotate())                   //自动进行服务依赖注入
            .pipe(concat(config.appName+'.js'))
            .pipe(gulpIf(IS_RELEASE, uglify({ preserveComments: 'some' })))
            .pipe(gulpIf(IS_RELEASE,rename({extname: '.min.js'})))
            .pipe(gulp.dest(config.outputDir))                        // 压缩版
    );

    return series(streams);

};
