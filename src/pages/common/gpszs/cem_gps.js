/**
 * Version:1.0.0
 * Author:sxp
 * Date:2019.04.12
 * 地图监控
 */
app.controller('gpsCtrl', ['$scope', '$hyUtil', 'TFConstant', function ($scope, $hyUtil, TFConstant) {
    $scope.orderList = $hyUtil.getLocal(TFConstant.LOCAL_NOT_SAVE) || [];
    $scope.location = null;// 定位坐标
    $scope.geoend = false;// 按钮是否可用
    var destination = null;// 目的地坐标
    var orderObj = null;// 待办工单
    var infoWindow = null;
    var mapView = null;
    var map = null;
    var markers = {};

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
    $scope.geolocation = function ($event, $map) {
        if (!$event.point) {
            hyMui.alert('定位失败');
            return;
        }
        $scope.location = {lng: $event.point.lng, lat: $event.point.lat};
        $scope.addr = $event.addressComponent.address;
        $scope.$evalAsync();
    };

    /**
     * 设置坐标点和信息窗体
     */
    function getMarkerList() {
        infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
        // 创建一个 Icon
        var startIcon = new AMap.Icon({
            size: new AMap.Size(18, 23),// 图标尺寸
            image: 'img/cem/common/cem_position.png',// 图标的取图地址
            imageSize: new AMap.Size(18, 23)// 图标所用图片大小
            // imageOffset: new AMap.Pixel(-9, -3)// 图标取图偏移量
        });
        $scope.orderList.forEach(function (item) {
            if (item.long1 && item.lati1) {
                var orderHtml = createHtml(item).join("");
                markers = new AMap.Marker({
                    map: map,
                    position: [item.long1, item.lati1],
                    icon: startIcon
                });
                markers.content = orderHtml;
                markers.cemOrder = item;
                markers.on('click', markerClick);
            }
        });
        infoWindow.on('close', infoClick);
        map.setFitView();
    }

    /**
     * 设置所属当前坐标点的信息
     * @param e
     */
    function markerClick(e) {
        orderObj = e.target.cemOrder;
        destination = {
            jd: orderObj.long1,
            wd: orderObj.lati1
        };
        $scope.geoend = true;
        infoWindow.setContent(e.target.content);
        infoWindow.open(map, e.target.getPosition());
        $scope.$digest();
    }

    /**
     * 监听信息窗体关闭事件
     * @param e
     */
    function infoClick(e) {
        $scope.geoend = false;
        $scope.$digest();
    }

    var menus = [
        {
            src: 'img/cem/home/cem_xcjc.png',
            menuName: '現場檢查',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/xcjcbl/cemydzy_xcjcrwbl.html',
            num: 0,
            hjh: '1168;1170;1169;1171',
            show: true
        },
        {
            src: 'img/cem/home/cem_aqyhjc.png',
            menuName: '安全隱患檢查',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/aqyhjcgdbl/cemydzy_aqyhgdbl.html',
            num: 0,
            hjh: '144;1890', /* 144 '2' */
            show: true
        },
        {
            src: 'img/cem/home/cem_lsjd.png',
            menuName: '臨時檢定',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/lsjd/cem_lsjdbl.html',
            num: 0,
            hjh: '98', /* 98 '9' */
            show: true
        },
        {
            src: 'img/cem/home/cem_lhjc.png',
            menuName: '聯合檢查',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/lhjc/cem_lhjcbl.html',
            num: 0,
            hjh: '1128', /* '4' */
            show: true
        },
        {
            src: 'img/cem/home/cem_gzcl.png',
            menuName: '故障處理',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/gzcl/cem_gzclbl.html',
            num: 0,
            hjh: '526', /* 526 '5' */
            show: true
        },
        {
            src: 'img/cem/home/cem_fdjc.png',
            menuName: '復電辦理',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/fdbl/cem_fdbl.html',
            num: 0,
            hjh: '784', /* 784 '6' */
            show: true
        },
        {
            src: 'img/cem/home/cem_tdbl.png',
            menuName: '停電辦理',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/tdbl/cem_tdbl.html',
            num: 0,
            hjh: '779', /* 779 '7' */
            show: true
        },
        {
            src: 'img/cem/home/cem_zcrw.png',
            menuName: '裝拆辦理',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/zcgdbl/cem_zcgdbl.html',
            num: 0,
            hjh: '118', /* 118 '3' */
            show: true
        },
        {
            src: 'img/cem/home/cem_more.png',
            menuName: '裝拆分派',
            target: 'pages/common/dblb/cem_dblb.html',
            workUrl: 'pages/cemydzy/zcgd/cemydzy_zcgdfp.html',
            num: 0,
            hjh: '115', /* 115 '8' */
            show: true
        },
        {
            src: 'img/cem/home/cem_zcgdcj.png',
            menuName: '裝拆工單創建',
            target: 'pages/cemydzy/zcgd/cemydzy_zcgdcj.html',
            workUrl: '',
            num: 0,
            hjh: 0,// 没有环节号，默认为0
            show: true
        },
        {
            src: 'img/cem/home/cem_dxxxcx.png',
            menuName: '信息查詢',
            target: 'pages/cemydzy/dxxxcx/cem_dxxxcx.html',
            workUrl: 'pages/cemydzy/fdbl/cem_fdbl.html',
            num: 0,
            hjh: 0,// 没有环节号，默认为0
            show: true
        },
        {
            src: 'img/cem/home/cem_sjsc.png',
            menuName: '數據上傳',
            target: '',
            workUrl: '',
            num: 0,
            hjh: 0,// 没有环节号，默认为0
            show: true
        }
    ];

    /**
     * 跳转办理界面
     */
    $scope.toDealWithOrder = function () {
        var task = {
            wkflwtachno: orderObj.wkflwtachno,
            wkordrno: orderObj.wkordrno,//工作单编号
            wkflowtaskno: orderObj.wkflowtaskno,
            wkflowstdtaskno: orderObj.wkflowstdtaskno,// 标准环节号
            cntracctno: orderObj.cntracctno// 合约账户
        };
        if (orderObj.wkflowstdtaskno === 144) {
            mainNavi.pushPage('pages/cemydzy/aqyhjcgdbl/cemydzy_aqyhgdbl.html', {
                cancelIfRunning: true,
                task: task,
                order: orderObj
            })
        } else if (orderObj.wkflowstdtaskno === 1890) {
            mainNavi.pushPage('pages/cemydzy/aqyhfcgdbl/cemydzy_aqyhgdfcbl.html', {
                cancelIfRunning: true,
                task: task,
                order: orderObj
            })
        } else if (orderObj.wkflowstdtaskno === 118) {
            mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                cancelIfRunning: true,
                task: task,
                order: item
            })
        } else if (orderObj.wkflowstdtaskno === 119) {
            mainNavi.pushPage('pages/cemydzy/zcgdbl/plzcxxlr/cem_plzclr.html', {
                cancelIfRunning: true,
                task: task,
                order: item
            })
        } else {
            mainNavi.pushPage(getTaskUrl(orderObj), {
                cancelIfRunning: true,
                task: task,
                order: orderObj
            });
        }
    };

    /**
     * 获得办理界面地址
     * @param task
     * @returns {string|*}
     */
    function getTaskUrl(task) {
        for (var i = 0; i < menus.length; i++) {
            if (menus[i].hjh.indexOf(task.wkflowstdtaskno.toString()) !== -1) {
                return menus[i].workUrl;
            }
        }
    }

    /**
     * 创建信息窗体HTML模板
     * @param item
     * @returns {Array}
     */
    function createHtml(item) {
        var info = [];
        info.push("<div class='input-card content-window-card'> ");
        info.push("<div style=\"padding:7px 0 0 0;\">");
        info.push("<div class=\"cem-query-result-item\">");
        info.push("<div class=\"hy-layout-row\"><div class=\"hy-layout-row\" style=\"width: 90px\">工作單編號</div>");
        info.push("<div class=\"hy-layout-row cem-result-form-content-ydjc\" style=\"font-size: 15px;flex: 1;\">");
        info.push(item.wkordrno);
        info.push("</div></div>");
        info.push("<div class=\"hy-layout-row\"><div class=\"hy-layout-row\" style=\"width: 90px\">環節名稱</div>");
        info.push("<div class=\"hy-layout-row cem-result-form-content-ydjc\" style=\"font-size: 15px;flex: 1;\">");
        info.push(item.wkflwtachnm);
        info.push("</div></div>");
        info.push("</div></div></div>");
        return info;
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
        var endPos = {latitude: destination.wd, longitude: destination.jd};
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