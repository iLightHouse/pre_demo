cordova.define("hy-cordova-plugins-mplus.HYMplus", function (require, exports, module) {
    var exec = require('cordova/exec');

    var HYMplus = function () {
    }

    HYMplus.prototype.init = function () {
        var win = function (result) {
            cordova.fireWindowEvent('onMPlusMessage', result);
        }
        exec(win, null, 'HYMplus', 'init', []);
    };
    HYMplus.prototype.login = function (successCallback, errorCallback, nickName) {
        var win = function (result) {
            successCallback && successCallback(result);
        }
        var fail = function (result) {
            errorCallback && errorCallback(result);
        }
        exec(win, fail, 'HYMplus', 'login', [nickName]);
    };
    HYMplus.prototype.setRead = function (successCallback, errorCallback, chatId, msgId, instanceId) {
        var win = function (result) {
            successCallback && successCallback(result);
        }
        var fail = function (result) {
            errorCallback && errorCallback(result);
        }
        exec(win, fail, 'HYMplus', 'setRead', [chatId, msgId, instanceId]);
    };
    HYMplus.prototype.logout = function (successCallback, errorCallback) {
        var win = function (result) {
            successCallback && successCallback(result);
        }
        var fail = function (result) {
            errorCallback && errorCallback(result);
        }
        exec(win, fail, 'HYMplus', 'logout');
    };

    module.exports = new HYMplus();

});
