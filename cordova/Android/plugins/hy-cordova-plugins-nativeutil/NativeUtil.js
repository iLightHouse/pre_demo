cordova.define("hy-cordova-plugins-nativeutil.NativeUtil", function (require, exports, module) {
    var exec = require('cordova/exec');

    var NativeUtil = function () {

    };

    NativeUtil.prototype.isPlatformIOS = function () {
        try {
            var isPlatformIOS = device.platform == "iPhone"
                || device.platform == "iPad"
                || device.platform == "iPod touch"
                || device.platform == "iOS";
            return isPlatformIOS;
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * Android:通过ComponentName包名+类名形式启动第三方应用
     *
     * @param successCallback
     * @param errorCallback(error) {code: 1, message: "无效的参数格式！"} {code: 2, message: "应用程序未安装！"}
     * @param packageName  {string}  必填  需要启动的第三方应用的包名（com.example.demo）
     * @param activity     {string}  必填  需要启动的类名（com.example.demo.MainActivity）
     * @param options      {object}  可选  传递参数
     */
    NativeUtil.prototype.startActivityByPackageName = function (successCallback, errorCallback, packageName, activity, options) {
        var win = function (result) {
            successCallback && successCallback(result);
        };
        var fail = function (result) {
            errorCallback && errorCallback(result);
        };
        if (this.isPlatformIOS()) {
            win();
            return;
        }
        exec(win, fail, 'NativeUtil', 'startActivityByPackageName', [packageName, activity, options]);
    };

    NativeUtil.prototype.startTxpbActicity = function (successCallback, errorCallback, options) {
        var win = function (result) {
            successCallback && successCallback(result);
        };
        var fail = function (result) {
            errorCallback && errorCallback(result);
        };
        if (this.isPlatformIOS()) {
            win();
            return;
        }
        exec(win, fail, 'NativeUtil', 'startTxpbActicity', [options]);
    };

    NativeUtil.prototype.startActivityByAction = function (successCallback, errorCallback, packageName, activity, options) {
        var win = function (result) {
            successCallback && successCallback(result);
        };
        var fail = function (result) {
            errorCallback && errorCallback(result);
        };
        if (this.isPlatformIOS()) {
            win();
            return;
        }
        exec(win, fail, 'NativeUtil', 'startActivityByAction', [packageName, activity, options]);
    };

    /**
     * Android:通过隐式意图启动第三方应用
     *
     * @param successCallback
     * @param errorCallback(error) {code: 1, message: "无效的参数格式！"} {code: 2, message: "应用程序未安装！"}
     * @param action       {string}  必填  需要启动的第三方应用配置的Action
     * @param category     {string}  必填  需要启动的第三方应用配置的Category
     * @param options      {object}  可选  传递参数
     */
    NativeUtil.prototype.startActivityByAction = function (successCallback, errorCallback, action, category, options) {
        var win = function (result) {
            successCallback && successCallback(result);
        };
        var fail = function (result) {
            errorCallback && errorCallback(result);
        };
        if (this.isPlatformIOS()) {
            win();
            return;
        }
        exec(win, fail, 'NativeUtil', 'startActivityByAction', [action, category, options]);
    };

    module.exports = new NativeUtil();

});
