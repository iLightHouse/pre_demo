/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/7
 * 签到
 */
app.controller('wdQiandaoCtrl', ['$scope', 'myService', function ($scope, myService) {

    // 定位结束标志
    $scope.geoend = false;
    // 初始化方法
    $scope.init = function ($event) {
        //initBefore();
    };
    var qd = false;
    //定位后回调
    $scope.geolocation = function ($event, $map) {
        $scope.geoend = true;
        if ($event.state !== 1) {
            hyMui.toast({
                message: '定位失败，请检查定位设置或稍后重试'
            });
            app.qdModel.hide();
            $scope.$evalAsync();
            return;
        }
        $scope.nowSign = {
            signTime: new Date(),
            point: $event.point,
            address: $event.addressComponent.address
        };
        $scope.$evalAsync();
        if (qd) {
            qd = false;
            var param = {
                lng: $event.point.lng,
                lat: $event.point.lat,
                address: $event.addressComponent.address,
                type: '2'
            };
            myService.zdqd(param).then(function (data) {
                app.qdModel.hide();
                if (data) {
                    hyMui.alert('签到成功');
                    return;
                }
                hyMui.alert('签到失败');
            }, function () {
                app.qdModel.hide();
                hyMui.alert('签到失败');
            });
        }

    };
    //地图显示控件
    $scope.mapControls = [
        {name: 'Scale', options: null}//比例尺
        , {name: 'ToolBar', options: null}//缩放控件
        , {name: 'Geolocation'}//定位
        , {name: 'Geocoder', options: null}
    ];

    /**
     * 主动签到
     */
    $scope.sdqd = function () {
        qd = true;
        $scope.geoend = false;
        app.qdModel.show();
        qdMapView.geolocationCtrl();
    }
}]);