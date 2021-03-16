/**
 * Created by keyu on 2017/9/7.
 * 导航服务
 */
app.factory('NavigateService', function () {
    var service = {};
    /**
     * 驾车导航
     *
     * @param beginPos          {object}  起点坐标  {latitude: 37.12345, longitude: 121.5689}
     * @param wayPos            {array}   途经点坐标,最多支持三个途经点 [{latitude: 37.12345, longitude: 121.5689}, {latitude: 37.12345, longitude: 121.5689}]
     * @param endPos            {object}  终点坐标  {latitude: 37.12345, longitude: 121.5689}
     * @param emulator          {boolean} 是否设置为模拟导航,true表示模拟导航，false表示真实GPS导航（默认true）
     * @param coordType          {number} 是传入的坐标类型,默认高德坐标类型，AMapNavi.COORD_AMAP(0)表示高德坐标，AMapNavi.COORD_GPS(1)表示GPS坐标
     * @param successCallback
     * @param errorCallback
     */
    service.navigate = function (beginPos, wayPos, endPos, emulator, coordType, successCallback, errorCallback) {
        if (!window.AMapNavi) {
            return;
        }
        coordType = coordType ? coordType : AMapNavi.COORD_AMAP;
        AMapNavi.navigateDrive(beginPos, wayPos, endPos, emulator, coordType, successCallback, errorCallback);
    };
    return service;
});