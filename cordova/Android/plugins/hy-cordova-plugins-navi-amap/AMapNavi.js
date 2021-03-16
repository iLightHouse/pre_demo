cordova.define("hy-cordova-plugins-navi-amap.AMapNavi", function(require, exports, module) { 
var exec = require('cordova/exec');

var AMapNavi = function () {

};

/** 高德坐标 */
AMapNavi.prototype.COORD_AMAP = 0;

/** GPS坐标 */
AMapNavi.prototype.COORD_GPS = 1;

AMapNavi.prototype.isPlatformIOS = function () {
    try {
        var isPlatformIOS = device.platform == "iPhone"
            || device.platform == "iPad"
            || device.platform == "iPod touch"
            || device.platform == "iOS";
        return isPlatformIOS;
    } catch (e) {
        console.log(e);
    }
}

/**
 * 导航初始化
 * @param options {appKey: ""} 导航初始化相关参数，ios只有一个appKey属性，用于设置导航组件的appKey参数。
 * @param successCallback
 * @param errorCallback
 */
AMapNavi.prototype.init = function (options, successCallback, errorCallback) {
    var win = function (result) {
        successCallback && successCallback(result);
    }
    var fail = function (result) {
        errorCallback && errorCallback(result);
    }

    if (this.isPlatformIOS()) {
        exec(win, fail, 'AMapNavi', 'naviInit', [options]);
    } else {
        win();
    }
};

/**
 * 驾车导航
 *
 * @param beginPos          {object}  起点坐标  {latitude: 37.12345, longitude: 121.5689}
 * @param wayPos            {array}   途经点坐标,最多支持三个途经点 [{latitude: 37.12345, longitude: 121.5689}, {latitude: 37.12345, longitude: 121.5689}]
 * @param endPos            {object}  终点坐标  {latitude: 37.12345, longitude: 121.5689}
 * @param emulator          {boolean} 是否设置为模拟导航,true表示模拟导航，false表示真实GPS导航（默认true）
 * @param coordType         {boolean} 传入的坐标类型,默认高德坐标  0: 高德坐标, 1: GPS坐标
 * @param successCallback
 * @param errorCallback
 */
AMapNavi.prototype.navigateDrive = function (beginPos, wayPos, endPos, emulator, coordType, successCallback, errorCallback) {
    var win = function (result) {
        successCallback && successCallback(result);
    }
    var fail = function (result) {
        errorCallback && errorCallback(result);
    }

    exec(win, fail, 'AMapNavi', 'navigateDrive', [beginPos, wayPos, endPos, emulator, coordType]);
};

/**
 * 步行导航
 *
 * @param beginPos          {object}  起点坐标  {latitude: 37.12345, longitude: 121.5689}
 * @param endPos            {object}  终点坐标  {latitude: 37.12345, longitude: 121.5689}
 * @param emulator          {boolean} 是否设置为模拟导航,true表示模拟导航，false表示真实GPS导航（默认true）
 * @param coordType         {boolean} 传入的坐标类型,,默认高德坐标   0: 高德坐标, 1: GPS坐标
 * @param successCallback
 * @param errorCallback
 */
AMapNavi.prototype.navigateWalk = function (beginPos, endPos, emulator, coordType, successCallback, errorCallback) {
    var win = function (result) {
        successCallback && successCallback(result);
    }
    var fail = function (result) {
        errorCallback && errorCallback(result);
    }

    exec(win, fail, 'AMapNavi', 'navigateWalk', [beginPos, endPos, emulator, coordType]);
};

/**
 * 定位
 * @param options {object} 可选,定位参数  {interval: 2000, timeout: 5000} 定位间隔(毫秒), 定位超时时间(毫秒)
 *						   注：默认定位一次,如果设置了定位间隔,则会重复定位。
 *
 * locationType//获取当前定位结果来源，如网络定位结果，详见定位类型表
 * latitude//获取纬度
 * longitude//获取经度
 * accuracy//获取精度信息
 * address//地址，如果option中设置isNeedAddress为false，则没有此结果，网络定位结果中会有地址信息，GPS定位不返回地址信息。
 * country//国家信息
 * province//省信息
 * city//城市信息
 * district//城区信息
 * street//街道信息
 * streetNum//街道门牌号信息
 * cityCode//城市编码
 * adCode//地区编码
 * aoiName//获取当前定位点的AOI信息
 * time//时间
 * @param successCallback
 * @param errorCallback
 */
AMapNavi.prototype.getCurrentPosition = function (options, successCallback, errorCallback) {
    var win = function (result) {
        successCallback && successCallback(result);
    }
    var fail = function (result) {
        errorCallback && errorCallback(result);
    }

	exec(win, fail, 'AMapNavi', 'getCurrentPosition', [options]);
	
};

/**
 * 停止定位
 *
 * @param successCallback
 * @param errorCallback
 */
AMapNavi.prototype.stopLocation = function (successCallback, errorCallback) {
    var win = function (result) {
        successCallback && successCallback(result);
    }
    var fail = function (result) {
        errorCallback && errorCallback(result);
    }

	exec(win, fail, 'AMapNavi', 'stopLocation', []);
    
};

module.exports = new AMapNavi();


});
