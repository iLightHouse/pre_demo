// exports.dependencies = ['build-libs-depend','build-www-depend','build-scss', 'build-js','build-asset-depend'];

var runSequence = require('run-sequence');
var series = require('stream-series');
var gutil = require('gulp-util');
exports.task = function () {

    gutil.log("开始进行build.....");
    runSequence('clean',
        ['build-libs-depend', 'build-www-depend', 'build-asset-depend'],
        'build-scss',
        'build-js')
};
