
var gulp = require('gulp');
var fs = require('fs');
var args = require('minimist')(process.argv.slice(2));
var path = require('path');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var nano = require('gulp-cssnano');  //css压缩
var filter = require('gulp-filter');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');




exports.minifyCss = minifyCss;
exports.filterNonCodeFiles = filterNonCodeFiles;
exports.args = args;
exports.autoprefix = autoprefix;

//配置自动处理浏览器前缀的函数
function autoprefix() {

    return autoprefixer({
        browsers: [
            'last 2 versions',
            'Android >= 4.4',
            'Safari >= 6',
            'Firefox >= 20',
            'iOS >= 6',
            'last 2 Explorer versions'
        ],
        cascade: false
    });
}

//压缩CSS文件
function minifyCss() {
    return nano({
        autoprefixer: false,
        reduceTransforms: false,
        svgo: false,
        safe: true
    });
}

//过滤不需要的文件
function filterNonCodeFiles() {
    return filter(function (file) {
        return !/demo|module\.json|script\.js|\.spec.js|README/.test(file.path);
    });
}





