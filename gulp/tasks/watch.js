var gulp = require('gulp');
var config = require('../config');
exports.dependencies = ['build'];

exports.task = function () {
    gulp.watch([config.libsFiles.minLib,config.libsFiles.sourceLib], ['build-libs-depend']);
    gulp.watch(config.jsSrcFiles, ['build-js']);
    gulp.watch(config.scssSrcFiles, ['build-scss']);
    gulp.watch(config.assetFiles,['build-asset-depend']);
    gulp.watch([config.wwwFiles.img.src,config.wwwFiles.pages.src,config.wwwFiles.index.src,config.wwwFiles.index.dev_src], ['build-www-depend']);
};
