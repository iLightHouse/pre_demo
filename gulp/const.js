
var path = require('path');
var args = require('minimist')(process.argv.slice(2));

exports.ROOT       = path.normalize(__dirname + '/..');
exports.IS_RELEASE     = args.release;
