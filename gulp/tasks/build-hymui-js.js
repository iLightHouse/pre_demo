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
exports.task = function () {
    gUtil.log("编译JS文件...");
    //生成总体的JS文件
    gulp.src(['libs/sourceMap/hyMobile/js/hyMobile-all.js'])
        .pipe(uglify({preserveComments: 'some'}))
        .on('error', function(err) {
            gUtil.log(gUtil.colors.red('[Error]'), err.toString());
        })
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('libs/min/hyMobile/js/'))                        // 压缩版
};
