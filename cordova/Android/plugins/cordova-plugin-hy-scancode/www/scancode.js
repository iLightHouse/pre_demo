cordova.define("cordova-plugin-hy-scancode.scancode", function(require, exports, module) { 
var exec = require('cordova/exec'),
    argscheck = require('cordova/argscheck');


/**
 * 用于进行二维码识别
 * 并带闪光灯及自定义按钮的功能接口
 * 执行回调方法传入的结果参数对象结构如下： { 'codes': [{
 * 'value': '扫描的条型码值'，
 * 'type': '扫描到的条码类型'
 * }], 'cancel': true|false, 'buttonIndex': index }
 * 注意，扫描成功时返回参数里，buttonIndex的值为-1
 * 点击自定义按钮返回的buttonIndex为按钮的索引值
 *
 */

var HYScanCode = function () {

};

/**
 * 二维码识别
 *
 * activeImage和selectImage对应的属性值只支持ios系统
 *
 * @param successCallback  识别成功回调及手动输入的接口
 * @param errorCallback 识别失败回调及返回回调
 * @param options 二维码识别界面中的元素配置参数对象，包含如下内容：
 * var options = {'title': '扫描标题',
 * 'buttons': [{
 *   'title': '按钮标题',
 *   'image': '按钮图标文件名',
 *   'imageExtension':'按钮图标文件扩展名',
 *   'imageDirectory':'按钮图标文件存放路径',
 *   'activeImage': '按钮图标文件名',
 *   'activeImageExtension':'按钮按下状态图标文件扩展名',
 *   'activeImageDirectory':'按钮按下状态图标文件存放路径',
 *   'back': true
 *}],
 *'light' : { 'title': '手电筒按钮标题',
 *   'image': '手电筒按钮图标文件名',
 *   'imageExtension':'手电筒按钮图标文件扩展名',
 *   'imageDirectory':'手电筒按钮图标文件存放路径',
 *   'selectedImage': '手电筒按钮选中状态图标文件名',
 *   'selectedImageExtension':'手电筒按钮选中状态图标文件扩展名',
 *   'selectedImageDirectory':'手电筒按钮选中状态图标文件存放路径'
 *},
 *'vibrate':true  默认false		//是否开启震动
 *'voice':true  默认false		//是否开启声音提示
 *'isAssets':false 默认false   //标识图片资源文件是否是来源于assets目录
 *};
 */

HYScanCode.prototype.scan = function(successCallback, errorCallback,options) {
	var defaultOptions = {
		title:'將二維碼放入框内',
		buttons:[],
		vibrate:false,
		voice:false,
		isAssets:false
	};
	options = options || {};
    for (var def in defaultOptions) {
        if (typeof options[def] === 'undefined') {
            options[def] = defaultOptions[def];
        }
    }
	var win = function(result) {
		successCallback && successCallback(result);
	};
	var fail = function(result) {
		errorCallback && errorCallback(result);
	};
	exec(win, fail, 'HYScanCode', 'scan', [options]);
};

module.exports = new HYScanCode();


});
