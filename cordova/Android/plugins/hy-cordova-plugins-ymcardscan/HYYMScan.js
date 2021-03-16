cordova.define("hy-cordova-plugins-ymcardscan.HYYMScan", function(require, exports, module) {

var exec = require('cordova/exec');

var HYYMScan = function () {

};

/**
 * 识别类型
 * @type {{IDCARD: number, BANK: number}}
 */
HYYMScan.prototype.Type = {

    /** 身份证 */
    IDCARD: 0,

    /** 银行卡 */
    BANKCARD: 1

};

/**
 * 证件识别
 *
 * @param successCallback(result)
 *
 * 身份证识别
 * result = {
 *              "Name":{"value":""},       // 姓名
 *              "Sex":{"value":""},        // 性别
 *              "Folk":{"value":""},       // 民族
 *              "Birt":{"value":""},       // 出生年月
 *              "Addr":{"value":""},       // 地址
 *              "Num":{"value":""},        // 身份证号
 *              "Issue":{"value":""},      // 签发机关
 *              "Valid":{"value":""},      // 有效期 2010.12.14-2020.12.14
 *              "Type":{"value":""},       // 正面/背面
 *              "Cover":{"value":""}       // 无遮挡
 *           }
 *
 * 银行卡识别
 * result = {
 *	            "Num": "6212263016001122012",
 *	            "Cardtype": "借记卡",
 *	            "Cardname": "牡丹卡普卡",
 *	            "Bankname": "工商银行(01020000)"
 *          }
 *
 * @param errorCallback(error)  {code: -100, message: ""}
 * @param cardType 卡类型
 */
HYYMScan.prototype.scan = function (successCallback, errorCallback, cardType) {
    var win = function (result) {
        successCallback && successCallback(result);
    };
    var fail = function (result) {
        errorCallback && errorCallback(result);
    };
    exec(win, fail, 'HYYMScan', 'scan', [cardType]);
};

module.exports = new HYYMScan();

});
