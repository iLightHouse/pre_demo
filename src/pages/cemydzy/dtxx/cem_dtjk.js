/**
 * Version:1.0.0
 * Author:sxp
 * Date:2019.04.12
 * 地图监控
 */
app.controller('DtjkCtrl', ['$scope', '$appConfig', function ($scope, $appConfig) {
    var positionInfo = mainNavi.getCurrentPage().options || {};
    var inPosition = positionInfo.position;
    var mapView = null;
    var map = null;
    var markerList = [];
    $scope.formFlag = positionInfo.flag;
    $scope.marker = {};
    $scope.param = {};
    $scope.location = null;// 定位坐标
    $scope.geoend = false;// 定位结束标志

    /**
     * 初始化方法
     * @param $event
     */
    $scope.init = function ($event) {
        mapView = $event;
        map = mapView.map;
        getMarkerList();
        // map.setZoomAndCenter(13, [113.571585, 22.137465]);//楚雄坐标位置
    };

    /**
     * 获取定位信息
     * @param $event
     * @param $map
     */
    $scope.geolocation = function ($event, $map) {  //定位之后的回调
        if (!$event.point) {
            hyMui.toast({message: '定位失敗'});
            return;
        }
        $scope.geoend = true;
        $scope.location = {lng: $event.point.lng, lat: $event.point.lat};
        if ($scope.formFlag === 'equipment') {
            $scope.addr = $event.addressComponent.address;
        }
        $scope.$evalAsync();
    };

    /**
     * 设置坐标点
     */
    function getMarkerList() {
        // 创建一个 Icon
        var startIcon = new AMap.Icon({
            size: new AMap.Size(18, 23),// 图标尺寸
            image: 'img/cem/common/cem_position.png',// 图标的取图地址
            imageSize: new AMap.Size(18, 23)// 图标所用图片大小
        });
        var marker = new AMap.Marker({
            position: [inPosition.jd, inPosition.wd],
            icon: startIcon
        });
        markerList.push(marker);
        map.add(markerList);
        if ($scope.formFlag !== 'equipment') {
            // 根据经纬度查询地址
            var geocoder = new AMap.Geocoder();
            geocoder.getAddress([inPosition.jd, inPosition.wd], function (status, result) {
                if (status === 'complete' && result.regeocode) {
                    $scope.addr = result.regeocode.formattedAddress;
                    $scope.$digest();
                } else {
                    hyMui.toast({message: '根據經緯度查詢地址失敗'});
                }
            });
        }
    }

    /**
     * 导航
     */
    $scope.navigation = function () {
        if (!$scope.location) {
            hyMui.toast({message: '未獲取到當前位置信息，請檢查定位設置'});
            return;
        }
        var beginPos = {latitude: $scope.location.lat, longitude: $scope.location.lng};
        var endPos = {latitude: inPosition.wd, longitude: inPosition.jd};
        var wayPos = [];
        window.AMapNavi && AMapNavi.navigateDrive(beginPos, wayPos, endPos, false, 0, function (result) {
            // hyMui.toast({message: '定位成功'});
        }, function (error) {
            hyMui.alert("error:" + error);
        });
    };

    //地图显示控件
    $scope.mapControls = [
        {name: 'Scale', options: null},//比例尺
        {name: 'Geolocation', options: null},
        {name: 'ToolBar', options: null},//缩放控件
        {name: 'Geocoder', options: null}
    ];

    $scope.buttonClick = function (button) {
        if (!button || !button.click) return;
        button.click.call(this);
    };

}]);