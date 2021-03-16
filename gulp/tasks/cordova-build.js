// exports.dependencies = ['build-libs-depend','build-www-depend','build-scss', 'build-js','build-asset-depend'];

var runSequence = require('run-sequence');
var gutil = require('gulp-util');
exports.task = function () {
    gutil.log("开始进行cordova 资源文件批处理.....");
    runSequence('cordova-www',
        'cordova-zip')
};
