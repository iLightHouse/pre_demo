var config = require('../config');
var gulp = require('gulp');
var series = require('stream-series');
var gUtil = require('gulp-util');
var IS_RELEASE = require('../const').IS_RELEASE;
var rename = require('gulp-rename');
var del = require('del');
exports.task = function () {
    var streams = [];

    gUtil.log("处理www的资源文件.......");


    //处理img图片资源
    streams.push(
        gulp.src(config.wwwFiles.img.src)
            .pipe(gulp.dest(config.wwwFiles.img.outPut))
    );
    //处理页面资源
    streams.push(
        gulp.src(config.wwwFiles.pages.src)
            .pipe(gulp.dest(config.wwwFiles.pages.outPut))
    );
    //处理json资源
    streams.push(
        gulp.src(config.wwwFiles.txts.src)
            .pipe(gulp.dest(config.wwwFiles.txts.outPut))
    );
    //处理首页资源
    streams.push(
        gulp.src(getIndexSrc())
            .pipe(rename('index.html'))
            .pipe(gulp.dest(config.wwwFiles.index.outPut))
    );
    //处理其他资源
    streams.push(
        gulp.src(config.wwwFiles.other.src)
            .pipe(gulp.dest(config.wwwFiles.other.outPut))
    );

    function getIndexSrc(){
        if(IS_RELEASE){
            return config.wwwFiles.index.src;
        }else{
            return config.wwwFiles.index.dev_src;
        }
    }

    return series(streams);

};
