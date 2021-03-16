/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/25
 * 路径规划
 */
app.controller('ljghCtrl', ['$scope', '$hyHttp', function ($scope, $hyHttp) {
    /**
     * 获取上个页面数据
     * 目前后台最多支持9个点
     * 参数样式：var addressData = [
     *   {address: '鲁东大学', text: '鲁东大学', jd: '120', wd: '37'},
     *   {address: '烟台南站', text: '烟台南站', jd: '120', wd: '37'}
     *   ];
     */
    var addressData = mainNavi.getCurrentPage().options.addressData;
    // 点数量校验
    if (addressData && addressData.length > 9) {
        hyMui.alert('路径规划最多支持9个点，请重新选择', function () {
            mainNavi.popPage();
        });
        return;
    }
    // 保存处理完的数据
    var address = [];
    // 定位坐标
    $scope.location = {};
    // 定位失败标志
    $scope.falt = false;
    // 导航信息展示
    $scope.dhxxShow = false;
    // 定位和地址转换是否已经完成一个
    var complete = false;
    // 高德地图起点
    var startMark = null;
    // 高德地图画线变量
    var polyline = null;
    // 初始化方法
    $scope.init = function ($event) {
        getPointByAddress($event);
    };

    // 逆定位
    function getPointByAddress(mapView) {
        for (var i = 0; i < addressData.length; i++) {
            (function (i) {
                if (addressData[i].jd && addressData[i].wd) {
                    addressData[i].location = [addressData[i].jd, addressData[i].wd];
                    markPoint(addressData[i]);
                    address.push(addressData[i]);
                    if (i === addressData.length - 1) {
                        dealData();
                        complete = true;
                    }
                    return;
                }
                mapView.getPointByAddress(addressData[i].address, function (data) {
                    if (i === addressData.length - 1) {
                        dealData();
                        complete = true;
                    }
                    if (data.info !== 'OK') {
                        return;
                    }
                    var location = data.data[0].location;
                    addressData[i].location = [location.lng, location.lat];
                    markPoint(addressData[i]);
                    address.push(addressData[i]);
                })
            })(i);
        }
    }

    // 处理要上传的数据
    function dealData() {
        if (!complete)
            return;
        if ((addressData.length - address.length) > 0) {
            hyMui.toast({message: addressData.length - address.length + '个地址查询位置信息失败'});
        }
        var allNodes = [{
            'bm': 0,
            'jd': $scope.location.lng,
            'wd': $scope.location.lat,
            'type': '0',
            'dz': '起点'
        }];
        //途径点
        for (var m = 0; m < address.length; m++) {
            if (!address[m].location) {
                return;
            }
            allNodes.push({
                'bm': m + 1,
                'jd': address[m].location[0],
                'wd': address[m].location[1],
                'type': '1',
                'dz': address[m].address
            });
        }
        //终点
        allNodes.push({
            'bm': allNodes.length,
            'jd': $scope.location.lng,
            'wd': $scope.location.lat,
            'type': '2',
            'dz': '终点'
        });
        var distanceArr = [];
        var fromPoint = '';
        var toPoint = '';
        var positionArray = [];
        for (var n = 0; n < allNodes.length - 1; n++) {
            fromPoint = allNodes[n].bm;
            for (var k = n + 1; k < allNodes.length; k++) {
                toPoint = allNodes[k].bm;
                positionArray.push({
                    'qdjd': allNodes[n].jd,
                    'qdwd': allNodes[n].wd,
                    'qdbm': allNodes[n].bm,
                    'zdjd': allNodes[k].jd,
                    'zdwd': allNodes[k].wd,
                    'zdbm': allNodes[k].bm
                });
            }
        }
        for (var p = 0; p < positionArray.length; p++) {
            var pos = positionArray[p];
            // 计算距离
            var lnglat = new $scope.ljghMapView.AMap.LngLat(pos.qdjd, pos.qdwd);
            var range = lnglat.distance([pos.zdjd, pos.zdwd]);
            var jl = (Number(range) / 1000).toFixed(2);
            distanceArr.push({
                'fromPoint': pos.qdbm,
                'toPoint': pos.zdbm === 0 ? (allNodes.length - 1) : pos.zdbm,
                'jl': jl
            });
        }
        var param = {
            allNodes: allNodes,
            distanceArr: distanceArr
        };
        ydyxLxgh(param);
    }

    //描点
    function markPoint(address) {
        var marker = new $scope.ljghMapView.AMap.Marker({ //添加自定义点标记
            map: $scope.ljghMapView.map,
            position: address.location //基点位置
        });

        $scope.ljghMapView.AMap.event.addListener(marker, 'click', function () {
            openInfoWindow(address);

        });
    }

    // 展示导航信息
    function openInfoWindow(address) {
        $scope.dhxx = address;
        $scope.dhxxShow = true;
        $scope.$applyAsync();
    }

    //画线
    function markLine(lineArr) {
        // 若再次定位，清除之前的画线
        if (polyline) {
            polyline.setMap(null);
        }
        polyline = new $scope.ljghMapView.AMap.Polyline({  //加点
            map: $scope.ljghMapView.map,
            path: lineArr,          //设置线覆盖物路径
            strokeColor: "#3366FF", //线颜色
            strokeOpacity: 1,       //线透明度
            strokeWeight: 3,        //线宽
            strokeStyle: "solid"   //线样式
        });
        // 使地图适应添加的点及标记
        $scope.ljghMapView.map.setFitView();
    }

    //定位后回调
    $scope.geolocation = function ($event, $map) {
        if ($event.state !== 1) {
            hyMui.toast({
                message: '定位失败，请检查定位设置或稍后重试'
            });
            $scope.falt = true;
            return;
        }
        // 若再次定位，清除之前的点标记
        if (startMark) {
            startMark.setMap(null);
        }
        startMark = new $scope.ljghMapView.AMap.Marker({ //添加自定义点标记
            map: $scope.ljghMapView.map,
            offset: new AMap.Pixel(-17, -42), //相对于基点的偏移位置
            icon: new AMap.Icon({
                size: new AMap.Size(40, 44),  //图标大小
                image: "http://webapi.amap.com/theme/v1.3/images/newpc/poi-1.png",
                imageOffset: new AMap.Pixel(-334, -180)
            }),
            position: [$event.point.lng, $event.point.lat] //基点位置
        });
        $scope.location = $event.point;
        hyMui.toast({message: '定位成功'});
        dealData();
        complete = true;
    };
//地图显示控件
    $scope.mapControls = [
        {name: 'Geolocation'},//定位
        {name: 'ToolBar', options: null},//缩放控件
        {name: 'Geocoder', options: null}
    ];

// 调用后台进行路线规划
    function ydyxLxgh(param) {
        $hyHttp.appPost('yDGLService', {
            'serviceName': 'ydyxLxgh',
            'jsonParams': JSON.stringify({
                'allNodes': param.allNodes,
                'jl': param.distanceArr
            })
        }).then(function (data) {
            if (!data || data.code !== '0') {
                hyMui.toast({message: '路径规划失败'});
                return;
            }
            var lineArr = [];
            for (var i = 0; i < data.zylj.length; i++) {
                for (var j = 0; j < param.allNodes.length; j++) {
                    if (data.zylj[i] == param.allNodes[j].bm && param.allNodes[j].type !== '2') {
                        lineArr.push([param.allNodes[j].jd, param.allNodes[j].wd]);
                        break;
                    }
                }
            }
            markLine(lineArr);
        }, function (err) {
            hyMui.toast({message: err});
        });
    }

    /**
     * 导航
     * @param address
     */
    $scope.daohang = function (address) {
        if (!$scope.location) {
            hyMui.toast({message: '尚未定位，请定位后重试'});
            return;
        }
        var beginPos = {latitude: $scope.location.lat, longitude: $scope.location.lng};
        var endPos = {latitude: address.location[1], longitude: address.location[0]};
        var wayPos = [];
        AMapNavi.navigateDrive(beginPos, wayPos, endPos, false, 0, function (result) {
        }, function (error) {
            hyMui.alert("error:" + error);
        });
    };
}]);