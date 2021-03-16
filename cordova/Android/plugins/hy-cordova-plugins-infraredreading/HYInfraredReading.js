cordova.define("hy-cordova-plugins-infraredreading.HYInfraredReading", function (require, exports, module) {
    var exec = require('cordova/exec');

    var HYInfraredReading = function () {

    };
    /**
     * 红外抄表
     *
     * @param successCallback(result) result {string} 抄表结果
     * @param errorCallback(error) {code: 100, message: ""}
     * @param options = {
 *      requestType: "", // 表类型
 *      dnb_id: "", // 表资产编号
 *      dnb_number_type: "" // 读取示数类型
 * }
     */
    HYInfraredReading.prototype.read = function (successCallback, errorCallback, options) {
        var win = function (result) {
            successCallback && successCallback(result);
        };
        var fail = function (result) {
            errorCallback && errorCallback(result);
        };
        exec(win, fail, 'HYInfraredReading', 'read', [options]);
    };
    HYInfraredReading.prototype.scan = function (successCallback, errorCallback) {
        var win = function (result) {
            successCallback && successCallback(result);
        };
        var fail = function (result) {
            errorCallback && errorCallback(result);
        };
        exec(win, fail, 'HYInfraredReading', 'scan', []);
    };
    module.exports = new HYInfraredReading();

});
