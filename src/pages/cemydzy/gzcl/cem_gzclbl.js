/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/16
 * 故障處理辦理
 */
app.controller("cemgzclCtrl", ['$scope', '$onsen', 'TaskService', '$appConfig', '$filter', '$hyUtil', '$http', 'gzclService', 'systemDropList', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, $onsen, TaskService, $appConfig, $filter, $hyUtil, $http, gzclService, systemDropList, $rootScope, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var saveFlag = false;// 保存成功后变为true
        var saveZc = false;// 装拆数据是否保存
        $scope.orderType = order.orderType;
        $scope.flag = false;// 默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; // 默認中文圖標顯示
        $scope.jbxx = {};

        function init() {
            initData();
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno + "gzcl").then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.jbxx = orderInfo.jbxx || {};
                        $scope.gzsbList = orderInfo.gzsbList || [];
                        $scope.zclu = $scope.jbxx.zclu;// 控制装拆工单入口显隐
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno + "gzcl").then(function (result) {
                    if (result || !navigator.onLine) {
                        getGzclOfflineOrder('local');
                    } else {
                        var inparam = {
                            "appVO": {
                                "wkflwtachno": "",
                                "wkordrno": task.wkordrno
                            },
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 0,
                                "rowOfPage": 100
                            }
                        };
                        hyMui.loaderShow();
                        gzclService.queryGzsbOrderInfo(inparam).then(function (data) {
                            hyMui.loaderHide();
                            if (data) {
                                initCommonData(data);
                                $scope.zclu = $scope.jbxx.jlzcjlcount > 0;// 控制装拆工单入口显隐
                            } else {
                                hyMui.alert("無數據");
                            }
                        }, function () {
                            getGzclOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function getGzclOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno + "gzcl").then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    if (orderInfo.flag === 'init') {
                        // 未点击过保存的初始化
                        initCommonData(orderInfo);
                        $scope.zclu = $scope.jbxx.jlzcjlcount > 0;// 控制装拆工单入口显隐
                    } else {
                        // 保存过的初始化，直接复制$scope对象
                        $scope.jbxx = orderInfo.jbxx || {};
                        $scope.gzsbList = orderInfo.gzsbList || [];
                        $scope.zclu = $scope.jbxx.zclu;// 控制装拆工单入口显隐
                    }
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        function initCommonData(data) {
            $scope.jbxx = data.qryfalhandtskinfoVO || {};
            $scope.jbxx.meterno = $filter('shortenNumber')($scope.jbxx.meterno);// 去零
            $scope.jbxx.contractno = $filter('shortenNumber')($scope.jbxx.contractno);// 去零
            systemDropList.getDropLable('GISTYPECD', $scope.jbxx.lowvoltequityp).then(function (label) {
                label = label || '';
                var supppntno = $scope.jbxx.supppntno || '';
                $scope.jbxx.supppntno = label + supppntno;
            });
            $scope.gzsbList = data.qryfalhanddetlinfoVOList || [];
            for (var i = 0; i < $scope.gzsbList.length; i++) {
                $scope.gzsbList[i].asseno = $filter('shortenNumber')($scope.gzsbList[i].asseno);// 去零
                if ($scope.gzsbList[i].equityp) {
                    (function (i) {
                        systemDropList.getDropLable('EQUITYPCD', $scope.gzsbList[i].equityp).then(function (label) {
                            $scope.gzsbList[i].equitypmc = label || $scope.gzsbList[i].equityp;
                        });
                    }(i));
                }
            }
        }

        /**
         * 保存方法
         * @returns {boolean}
         */
        $scope.save = function () {
            if (!$scope.jbxx.tsksts) {
                hyMui.alert('請填寫處理結果');
                return
            }
            for (var i = 0; i < $scope.gzsbList.length; i++) {
                if (!$scope.gzsbList[i].faulhandmde) {
                    hyMui.alert('請選擇處理方式');
                    return;
                }
                if (!$scope.gzsbList[i].faulphen) {
                    hyMui.alert('請填寫故障描述');
                    return;
                }
            }
            var inparam = {
                "appCustfldtskVO": {
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.contractno),
                    "fldtskid": $scope.jbxx.fldtskid,
                    "operatorid": $appConfig.getUserInfo().RYBS,
                    "wkflowtaskno": task.wkflowtaskno,//任務號
                    "tskfnshdt": $scope.jbxx.tskfnshdt,
                    "tskhndlsituat": $scope.jbxx.tskhndlsituat,
                    "tsksts": $scope.jbxx.tsksts,
                    "wkordrno": $scope.jbxx.wkordrno
                },
                "voList": []
            };
            for (var i = 0; i < $scope.gzsbList.length; i++) {
                var newGzsb = {
                    "anaydt": $scope.jbxx.tskfnshdt ? $scope.jbxx.tskfnshdt : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    "equiplstid": $scope.gzsbList[i].equiplstid,
                    "faulcatg": $scope.gzsbList[i].faulcatg,
                    "faulhandmde": $scope.gzsbList[i].faulhandmde,
                    "faulphen": $scope.gzsbList[i].faulphen,
                    "faultyp": $scope.gzsbList[i].faultyp,
                    "fldtskid": $scope.jbxx.fldtskid,
                    "operatorid": $appConfig.getUserInfo().RYBS,
                    "wkordrno": $scope.jbxx.wkordrno
                };
                inparam.voList.push(newGzsb);
            }
            if (!navigator.onLine) {
                saveGzclOffline(inparam);
                return;
            }
            hyMui.loaderShow();
            gzclService.saveGzclOrderInfo(inparam).then(function (data) {
                hyMui.loaderHide();
                if (data && data.rslt == '0') {
                    saveFlag = true;
                    order.orderType = '1';// 工单状态，1.已保存 2.已传递
                    order.offLineState = false;// 非离线工单
                    order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                    // 保存成功后，只要存在 存在 FAULHANDMDE 等于03（更换设备）或04（更换设备且室内检定）,将录入装拆数据显示出来，否则隐藏
                    $scope.zclu = $scope.gzsbList.some(function (item) {
                        return item.faulhandmde === '03' || item.faulhandmde === '04';
                    });
                    $scope.jbxx.zclu = $scope.zclu;//如果工单有网初始化jlzcjlcount==0，则需要更新装拆入口
                    var orderInfo = {
                        jbxx: $scope.jbxx,
                        gzsbList: $scope.gzsbList
                    };
                    PassOrderService.savePassOrder(orderInfo, order, 'gzcl'); // 本地緩存传递工单数据
                    // 刪除此工单入参本地数据（目的为了初始化查询离线数据）
                    OfflineParamService.delOfflineParam(task.wkordrno + "gzcl");
                    // 删除装拆工单数据和入参数据
                    OfflineParamService.delOfflineParam(task.wkordrno);
                    OfflineOrderService.delOfflineOrder(task.wkordrno);
                    toZcxxluPage();// 校验是否存在装拆录入
                    if (!$scope.zclu || saveZc) {
                        hyMui.alert("保存成功");
                    }
                } else {
                    //针对处理方式选择了更换设备，并发起了装拆任务，并且装拆信息录入已装拆，则故障处理页面再次点击保存，会提示“设备（20001695）已装拆”
                    var flag = false;
                    for (var i = 0; i < inparam.voList.length; i++) {
                        if (inparam.voList[i].faulhandmde == '03' || inparam.voList[i].faulhandmde == '04') {
                            flag = true;
                            break;
                        }
                    }
                    if (flag && data && data.rsltinfo.indexOf("保存") >= 0) {
                        saveFlag = true;
                        order.orderType = '1';// 工单状态，1.已保存 2.已传递
                        order.offLineState = false;// 非离线工单
                        order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                        var orderInfo = {
                            jbxx: $scope.jbxx,
                            gzsbList: $scope.gzsbList
                        };
                        PassOrderService.savePassOrder(orderInfo, order, 'gzcl'); // 本地緩存传递工单数据
                        // 刪除此工单入参本地数据（目的为了初始化查询离线数据）
                        OfflineParamService.delOfflineParam(task.wkordrno + "gzcl");
                        hyMui.alert("保存成功");
                    } else {
                        var mess = "保存失敗";
                        if (data && data.rsltinfo) {
                            mess = data.rsltinfo + ",請點擊傳遞按鈕";
                        }
                        hyMui.alert(mess);
                        if (mess !== '保存失敗') saveFlag = true;
                    }
                }
            }, function () {
                saveGzclOffline(inparam);
                hyMui.loaderHide();
            });
        };

        function saveGzclOffline(inparam) {
            var orderInfo = {
                jbxx: $scope.jbxx || {},
                gzsbList: $scope.gzsbList || []
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(orderInfo, order, inparam, null, 'gzcl');
        }

        /**
         * 传递
         * @returns {boolean}
         */
        $scope.send = function () {
            if ($scope.zclu && !saveZc && !$scope.orderType) {
                hyMui.alert("請先保存裝拆數據信息");
                return;
            }
            // 从未办理进入并且未保存过，从本地数据库获取并且未保存过 给予提示
            if ((!$scope.orderType && !saveFlag) || ($scope.netWorkStatus === 'local' && !saveFlag)) {
                hyMui.alert("請先實時保存信息");
                return;
            }
            var taskInfo = {
                wkordrno: task.wkordrno,
                wkflowinstno: task.wkflowinstno,
                wkflowtaskno: task.wkflowtaskno
            };
            hyMui.loaderShow();
            TaskService.passGzd(taskInfo).then(function (data) {
                hyMui.loaderHide();
                if (data && data.rslt === '0') {
                    hyMui.alert("傳遞成功", function () {
                        order.orderType = '2';// 工单状态，1.已保存 2.已传递
                        order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_PASS_ORDER", order);
                        mainNavi.popPage();
                    });
                } else {
                    hyMui.alert("傳遞失敗");
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        /**
         * 语言切换，默认显示中
         * @param flag
         */
        $scope.changeLanguage = function (flag) {
            $scope.flag = !flag;
            if ($scope.flag) {
                $scope.languageSrc = 'img/cem/db/language_check.png';//英文
            } else {
                $scope.languageSrc = 'img/cem/db/chines.png'//中文
            }
        };

        /**
         * 打开地图
         * @param flag
         */
        $scope.openMap = function (flag) {
            var position = null;
            if (flag === 'equipment') {
                position = {jd: $scope.jbxx.long1, wd: $scope.jbxx.lati1}
            } else {
                position = {
                    jd: order.lon,
                    wd: order.lati,
                    supppntno: $scope.jbxx.supppntno,
                    lowvoltequityp: $scope.jbxx.lowvoltequityp
                };
                OrderMapService.toMapLocation(position, flag);
                return;
            }
            if (!position.jd || !position.wd || position.jd == '-1' || position.wd == '-1' || position.jd == '-2' || position.wd == '-2') {
                hyMui.alert('經緯度不存在，無法查看');
                return;
            }
            mainNavi.pushPage("pages/cemydzy/dtxx/cem_dtjk.html", {
                position: position,
                flag: flag,
                cancelIfRunning: true
            })
        };

        $scope.clfsDrop = [];

        function initData() {
            $scope.jcjgDrop = [{
                DMBMMC: "完成",
                DMBM: "01"
            }, {
                DMBMMC: "未完成",
                DMBM: "00"
            }];
            systemDropList.getDropInfoList('FAULHANDMDECD').then(function (list) {
                if (list) {
                    $scope.clfsDrop = list;
                }
            });
        }

        /**
         * 跳转装拆信息处理
         */
        $scope.toLrlszc = function () {
            var pageData = {
                jbxx: $scope.jbxx || {},
                gzsbList: $scope.gzsbList || []
            };
            mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                cancelIfRunning: true,
                task: task,
                order: order,
                fromPage: 'gzcl',
                lsjdOrderType: $scope.orderType === '2' ? true : false,
                gzclPageData: pageData // 故障处理界面数据
            })
        };

        /**
         * 判断是否展示装拆信息录入功能
         */
        function toZcxxluPage() {
            // 已经保存过了，不在进行下放的提示
            if (saveZc) return;
            if ($scope.zclu) {
                hyMui.confirm({
                    title: '確認',
                    message: '保存成功，是否前往錄入裝拆數據？',
                    buttonLabels: ['取消', '前往'],
                    callback: function (i) {
                        if (i !== 1) {
                            return;
                        }
                        var pageData = {
                            jbxx: $scope.jbxx || {},
                            gzsbList: $scope.gzsbList || []
                        };
                        mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                            cancelIfRunning: true,
                            task: task,
                            order: order,
                            fromPage: 'gzcl',
                            lsjdOrderType: $scope.orderType === '2' ? true : false,
                            gzclPageData: pageData // 故障处理界面数据
                        })
                    }
                });
            }
        }

        $scope.$on('LSJD_ZCLR_SUCCESS', function (ev, item) {
            saveZc = item;
        });

    }]);