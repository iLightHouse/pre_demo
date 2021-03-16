/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/27
 * 對象信息查詢
 */
app.controller("cemdxxxcxCtrl", ['$scope', 'dxxxService', 'systemDropList', '$filter', '$appConfig', function ($scope, dxxxService, systemDropList, $filter, $appConfig) {
    $scope.flag = false;// 是否有數據
    $scope.updown = true;// 初始化時展開
    $scope.queryType = null;// 查詢對象類型
    $scope.showMap = false;// 显示地图图标
    $scope.query = {
        dxlx: '1'
    };
    $scope.gddlxDrop = [];
    $scope.resultList = [];// 查询出来的数据

    $scope.dxlxDrop = [{
        DMBMMC: "房產",
        DMBM: "1"
    }, {
        DMBMMC: "地址",
        DMBM: "2"
    }, {
        DMBMMC: "供電點",
        DMBM: "3"
    }, {
        DMBMMC: "電錶",
        DMBM: "4"
    }, {
        DMBMMC: "拆回設備",
        DMBM: "5"
    }];
    $scope.sblbDrop = [{
        DMBMMC: "電能表",
        DMBM: "01"
    }, {
        DMBMMC: "互感器",
        DMBM: "02"
    }, {
        DMBMMC: "鎖",
        DMBM: "21"
    }];
    systemDropList.getDropInfoList('GISTYPECD').then(function (list) {
        $scope.gddlxDrop = list || [];
    });

    systemDropList.getDropInfoList('DSTRCD').then(function (list) {
        $scope.qyDrop = list || [];
    });

    $scope.selectDxlx = function (value) {
        $scope.queryType = value;// 初始化时，自动赋值为1了
        if (value === '1') {
            $scope.dxmc = '房產編號';
            clearOther();
        } else if (value === '2') {
            $scope.dxmc = '地址編號';
            clearOther();
        } else if (value === '3') {
            $scope.dxmc = '供電點編號';
            clearOther();
        } else if (value === '4') {
            $scope.dxmc = '電錶編號';
            clearOther();
        } else if (value === '5') {
            $scope.dxmc = '設備類別';
            clearOther();
            $scope.query.zcrq = $filter('date')(new Date(), 'yyyy-MM-dd');
        }
        // 設置供電點字段寬度
        if (value === '3') {
            $scope.styleWidth = {width: '35%'}
        } else {
            $scope.styleWidth = null;
        }
    };

    function clearOther() {
        for (var key in $scope.query) {
            if (key !== 'dxlx') {
                $scope.query[key] = '';
            }
        }
    }

    var param = null; // 接口入參
    var addData = null; // 对象追加字段
    var keys = null; // 返回对象属性名组成的数组
    var serviceName = null;// 调用的服务名

    /**
     * 查詢對象信息
     */
    $scope.queryDxxx = function () {
        switch ($scope.queryType) {
            case '1':
                param = {
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 1,
                        "rowOfPage": 100
                    },
                    "vo": {
                        "premnm": $scope.query.fcmc,
                        "detaaddr": $scope.query.fcdz,
                        "premno": $scope.query.bh
                    }
                };
                addData = {
                    DXBH: '房產編號',
                    DXMC: '房產名稱',
                    DXDZ: '房產地址',
                    type: '房產'
                };
                keys = {
                    no: 'premno',
                    name: 'premnm',
                    addr: 'detaaddr',
                    lon: 'long1',
                    lati: 'lati1'

                };
                serviceName = 'queryHouseInfo';
                $scope.showMap = true;
                $scope.showPhotoPic = true;
                $scope.showTotal = false;// 显示条数
                break;
            case '2':
                param = {
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 0,
                        "rowOfPage": 100
                    },
                    "vo": {
                        "addrenglnm": "",
                        "addrobjnm": "",
                        "addrobjno": $scope.query.bh,// 地址编号
                        "efftm": "",// 生效时间
                        "expitm": "",// 失效时间
                        "dstrcd": $scope.query.qy,
                        "strnm": $scope.query.jd,// 街道
                        "strtstrno": $scope.query.mph // 門牌號
                    }
                };
                addData = {
                    DXBH: '地址編號',
                    DXMC: '地址名稱',
                    DXDZ: '地址地址',
                    QY: '區域',
                    JD: '街道',
                    MPH: '門牌號',
                    type: '地址'
                };
                keys = {
                    no: 'addrobjno',
                    name: 'addrobjnm',
                    qy: 'dstrcd',
                    jd: 'strnm',
                    mph: 'strtstrno'
                };
                serviceName = 'queryAddressInfo';
                $scope.showMap = false;
                $scope.showPhotoPic = true;
                $scope.showTotal = false;// 显示条数
                break;
            case '3':
                param = {
                    "infoVo": {
                        "lowvoltequityp": $scope.query.gddlx,
                        "supppntno": $scope.query.bh
                    },
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 0,
                        "rowOfPage": 100
                    }
                };
                addData = {
                    DXBH: '供電點編號',
                    DXMC: '供電點類型',
                    DXDZ: '低壓設備編號',
                    type: '供電點'
                };
                keys = {
                    no: 'supppntno',
                    name: 'lowvoltequityp',
                    addr: 'lowvoltequino',
                    lon: 'lon',
                    lati: 'lati'
                };
                serviceName = 'queryElectInfo';
                $scope.showMap = true;
                $scope.showPhotoPic = false;
                $scope.showTotal = false;// 显示条数
                break;
            case '4':
                param = {
                    "appQueryMeterInfoVO": {
                        "asseno": $filter('lengthenNumber')(18, $scope.query.bh),// 补零
                        "equilocdescr": "",
                        "equilocengldescr": "",
                        "cntracctno": $filter('lengthenNumber')(12, $scope.query.hyzh) // 合約賬號
                    },
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 0,
                        "rowOfPage": 100
                    }
                };
                addData = {
                    DXBH: '電錶編號',
                    DXMC: '設備類型',
                    DXDZ: '設備位置',
                    // HYZH: '合約編號',
                    type: '電錶'
                };
                keys = {
                    no: 'asseno',
                    name: 'equityp',
                    addr: 'equilocdescr',
                    hyzh: 'cntracctno',
                    lon: 'long1',
                    lati: 'lati1'
                };
                serviceName = 'queryMeterInfo';
                $scope.showMap = true;
                $scope.showPhotoPic = true;
                $scope.showTotal = false;// 显示条数
                break;
            case '5':
                param = {
                    "appRemoveeqinVO": {
                        "curhand": $appConfig.userInfo.RYBS,
                        "irdt": $scope.query.zcrq
                    },
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 1,
                        "rowOfPage": 100
                    }
                };
                addData = {
                    DXBH: '資產編號',
                    DXMC: '設備類別',
                    DXDZ: '設備類型'
                };
                keys = {
                    no: 'asseno',
                    name: 'equiclas',
                    addr: 'equityp'
                };
                serviceName = 'queryRemoveEquipList';
                $scope.showMap = false;
                $scope.showPhotoPic = false;
                $scope.showTotal = true;
                break;
        }
        commonQueryDxxx(serviceName, addData, param, keys);
    };

    /**
     * 对象信息查询并重新封装数据
     * @param serviceName 服务名称
     * @param addData 向新数组中追加的字段
     * @param param 请求入参
     * @param keys 新数组中各对象的字段名称
     */
    function commonQueryDxxx(serviceName, addData, param, keys) {
        hyMui.loaderShow();
        dxxxService[serviceName](param).then(function (data) {
            hyMui.loaderHide();
            if (data.votList && data.votList.length > 0) {
                var newList = [];
                for (var i = 0; i < data.votList.length; i++) {
                    var objInfo = {
                        PROPERTYNO: data.votList[i][keys.no],
                        PROPERTYNAME: data.votList[i][keys.name],
                        PROPERTYADDRESS: data.votList[i][keys.addr] || '',
                        // 地址對象中的字段
                        PROPERTYQY: data.votList[i][keys.qy] || '',
                        PROPERTYJD: data.votList[i][keys.jd] || '',
                        PROPERTYMPH: data.votList[i][keys.mph] || '',
                        PROPERTYHYZH: data.votList[i][keys.hyzh] || '',
                        // 供电点、电表、房产经纬度
                        lon: data.votList[i][keys.lon] || '',
                        lati: data.votList[i][keys.lati] || ''
                    };
                    Object.assign(objInfo, addData);
                    newList.push(objInfo);
                }
                $scope.resultList = newList;
                if ($scope.showMap) {
                    $scope.resultList.forEach(function (item) {
                        item.lowvoltequityp = item.PROPERTYNAME;
                        (function (item) {
                            if (serviceName === 'queryElectInfo') {
                                systemDropList.getDropLable('GISTYPECD', item.PROPERTYNAME).then(function (label) {
                                    item.PROPERTYNAME = label || item.PROPERTYNAME;
                                });
                            }
                        })(item)
                    })
                }
                // 地址
                if (serviceName === 'queryAddressInfo') {
                    $scope.resultList.forEach(function (item) {
                        (function (item) {
                            systemDropList.getDropLable('DSTRCD', item.PROPERTYQY).then(function (label) {
                                item.PROPERTYQY = label || item.PROPERTYQY;
                                if (item.PROPERTYQY == '82000000') {
                                    item.PROPERTYQY = '澳門';
                                }
                                if (item.PROPERTYQY == '86') {
                                    item.PROPERTYQY = '中國';
                                }
                            });
                        })(item)
                    });
                }
                // 电表
                if (serviceName === 'queryMeterInfo') {
                    $scope.resultList.forEach(function (item) {
                        (function (item) {
                            item.PROPERTYNO = $filter('shortenNumber')(item.PROPERTYNO); // 去零
                            systemDropList.getDropLable('EQUITYPCD', item.PROPERTYNAME).then(function (label) {
                                item.PROPERTYNAME = label || item.PROPERTYNAME;
                            });
                        })(item)
                    });
                }
                // 拆回设备
                if (serviceName === 'queryRemoveEquipList') {
                    $scope.resultList = newList.filter(function (item) {
                        item.PROPERTYNO = $filter('shortenNumber')(item.PROPERTYNO); // 去零
                        // 筛选查询条件对应的设备类别
                        if ($scope.query.sblb) {
                            return item.PROPERTYNAME === $scope.query.sblb;
                        } else {
                            return item.PROPERTYNAME === '01' || item.PROPERTYNAME === '02' || item.PROPERTYNAME === '21';
                        }
                    });
                    // 翻译设备类别、设备类型
                    $scope.resultList.forEach(function (it) {
                        switch (it.PROPERTYNAME) {
                            case '01':
                                it.PROPERTYNAME = '電能表';
                                break;
                            case '02':
                                it.PROPERTYNAME = '互感器';
                                break;
                            case '21':
                                it.PROPERTYNAME = '鎖';
                                break;
                        }
                        (function (it) {
                            systemDropList.getDropLable('EQUITYPCD', it.PROPERTYADDRESS).then(function (label) {
                                it.PROPERTYADDRESS = label || it.PROPERTYADDRESS;
                            });
                        })(it)
                    })
                }
            } else {
                $scope.resultList = [];
            }
        }, function () {
            hyMui.loaderHide();
        });
    }

    /**
     * 跳轉查看圖片界面
     */
    $scope.showPhoto = function (item) {
        if (item.type === '電錶') {
            item.PROPERTYNO = $filter('lengthenNumber')(18, item.PROPERTYNO);
        }
        mainNavi.pushPage('pages/cemydzy/dxxxcx/cem_cktp.html', {
            cancelIfRunning: true,
            condition: {
                propertyno: item.PROPERTYNO,
                type: item.type
            }
        })
    };

    /**
     * 打开地图
     * @param item
     */
    $scope.openMap = function (item) {
        var position = {jd: item.lon, wd: item.lati};
        if (item.type === '電錶' || item.type === '房產') {
            if (!position.jd || !position.wd || position.jd == '-1' || position.wd == '-1' || position.jd == '-2' || position.wd == '-2') {
                hyMui.alert('經緯度不存在，無法查看');
                return;
            }
            mainNavi.pushPage("pages/cemydzy/dtxx/cem_dtjk.html", {
                position: position,
                cancelIfRunning: true
            });
            return;
        }
        if (!position.jd || !position.wd || position.jd == '-1' || position.wd == '-1' || position.jd == '-2' || position.wd == '-2') {
            var param = {
                "voList": [
                    {
                        "gisequityp": item.lowvoltequityp,
                        "gisid": item.PROPERTYNO,
                        "lati": 0,
                        "lon": 0
                    }
                ]
            };
            hyMui.loaderShow();
            dxxxService.queryGddPosition(param).then(function (res) {
                hyMui.loaderHide();
                position.jd = res.lon || '';
                position.wd = res.lati || '';
                if (!position.jd || !position.wd || position.jd == '-1' || position.wd == '-1' || position.jd == '-2' || position.wd == '-2') {
                    hyMui.alert('經緯度不存在，無法查看');
                    return;
                }
                mainNavi.pushPage("pages/cemydzy/dtxx/cem_dtjk.html", {
                    position: position,
                    cancelIfRunning: true
                })
            }, function () {
                hyMui.loaderHide();
            });
        } else {
            mainNavi.pushPage("pages/cemydzy/dtxx/cem_dtjk.html", {
                position: position,
                cancelIfRunning: true
            })
        }
    };
}]);