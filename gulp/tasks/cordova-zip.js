var config = require('../config');
var gulp = require('gulp');
var del = require('del');
var path = require('path');
var exec = require('child_process').exec;
exports.task = function () {
    var jarPath = path.join(process.cwd(), config.script.zipJar);
    var wwwPath = path.join(process.cwd(), config.corodva.wwwRoot);
    var shellCommand = 'java -jar ' + jarPath + ' zip ' + wwwPath + ' ' + config.corodva.zipPassword;

    exec(shellCommand, function (err, stdout, stderr) {

        // process.stdout.write(stdout);
        // process.stderr.write(stderr);
        gulp.src(config.corodva.sourceZip)
            .pipe(gulp.dest(config.corodva.toTargetPath));
        console.log("拷贝www.zip资源到目标地址完成");

    });




};
