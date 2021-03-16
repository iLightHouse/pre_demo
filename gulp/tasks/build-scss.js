var config = require('../config');
var gulp = require('gulp');
var gUtil = require('gulp-util');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var series = require('stream-series');
var util = require('../util');
var sass = require('gulp-sass');
var gulpIf = require('gulp-if');
var minifyCss = util.minifyCss;
var IS_RELEASE = require('../const').IS_RELEASE;
exports.task = function() {
    var streams = [];

    gUtil.log("编译CSS文件...");


    //生成总体的CSS文件

    streams.push(
        gulp.src(config.scssSrcFiles)
            .pipe(util.filterNonCodeFiles())
            .pipe(concat(config.appName+'.scss'))
            .pipe(gulp.dest(config.tempPath))            // 合并成一个SASS文件
            .pipe(sass())                   //进行编译
            .pipe(util.autoprefix())            //处理前缀
            .pipe(gulpIf(IS_RELEASE, minifyCss()))
            .pipe(gulpIf(IS_RELEASE,rename({extname: '.min.css'})))
            .pipe(gulp.dest(config.outputDir))                        // 压缩版
    );

    return series(streams);

};
