cordova.define("hy-cordova-plugins-sangforvpn.HYSangfor", function(require, exports, module) { var exec = require('cordova/exec');

var HYSangfor = function () {

}

/**
 * VPN获取用户信息
 *
 * @param successCallback(result)  {token: "", uid: ""}
 * @param errorCallback
 */
HYSangfor.prototype.getUserInfo = function (successCallback, errorCallback) {
    var win = function (result) {
        successCallback && successCallback(result);
    };
    var fail = function (result) {
        errorCallback && errorCallback(result);
    };
    exec(win, fail, 'HYSangfor', 'getUserInfo', []);
};

module.exports = new HYSangfor();

});
