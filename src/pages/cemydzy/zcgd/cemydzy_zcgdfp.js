/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/13
 * 裝拆工單分派辦理
 */
app.controller("zcgdfpblCtrl", ['$scope', 'zcgdfpService', 'TaskService', '$appConfig', 'systemDropList', '$filter', '$http', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, zcgdfpService, TaskService, $appConfig, systemDropList, $filter, $http, $rootScope, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        $scope.orderType = order.orderType;
        $scope.flag = false;//默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; //默認中文圖標顯示
        $scope.zcfpInfo = {};// 装拆工单分派信息
        $scope.gzjgDrop = [{
            DMBMMC: "通過",
            DMBM: "1"
        }, {
            DMBMMC: "不通過",
            DMBM: "2"
        }];
        /**
         * 初始化方法
         * @returns
         */
        function init() {
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.zcfpInfo = orderInfo.zcfpInfo || {};
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getZcfpOfflineOrder('local');
                    } else {
                        var param = {
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 10
                            },
                            "vo": {
                                "wkflwtachno": task.wkflwtachno,
                                "wkordrno": task.wkordrno
                            }
                        };
                        hyMui.loaderShow();
                        zcgdfpService.queryZcgdfpOrderInfo(param).then(function (data) {
                            hyMui.loaderHide();
                            data.zcfpVo.meterno = $filter('shortenNumber')(data.zcfpVo.meterno);// 去零
                            data.zcfpVo.contractno = $filter('shortenNumber')(data.zcfpVo.contractno);// 去零
                            $scope.zcfpInfo = data.zcfpVo;
                            systemDropList.getDropLable('GISTYPECD', $scope.zcfpInfo.lowvoltequityp).then(function (label) {
                                label = label || '';
                                var supppntno = $scope.zcfpInfo.supppntno || '';
                                $scope.zcfpInfo.supppntno = label + supppntno;
                            });
                            systemDropList.queryUserInfo(data.zcfpVo.leader).then(function (data) {
                                var item = {label: data.rymc, code: data.rybs};
                                $scope.zcfpInfo.leaderMc = item.label;
                            });
                        }, function () {
                            getZcfpOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function getZcfpOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    orderInfo.zcfpVo.meterno = $filter('shortenNumber')(orderInfo.zcfpVo.meterno);// 去零
                    orderInfo.zcfpVo.contractno = $filter('shortenNumber')(orderInfo.zcfpVo.contractno);// 去零
                    $scope.zcfpInfo = orderInfo.zcfpVo;
                    systemDropList.queryUserInfo(orderInfo.zcfpVo.leader).then(function (data) {
                        var item = {label: data.rymc, code: data.rybs};
                        $scope.zcfpInfo.leaderMc = item.label;
                    });
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }


        /**
         * 保存方法
         */
        $scope.save = function () {
            if (!$scope.zcfpInfo.leader || !$scope.zcfpInfo.plantime) {
                hyMui.alert("請選擇裝拆人員和計劃執行日期");
                return;
            }
            var jhzxrq = $scope.zcfpInfo.plantime || NaN;
            if (new Date(jhzxrq) < new Date()) {
                hyMui.alert("計劃執行日期不能早於當前時間");
                return;
            }
            var param = {
                "list": [
                    {
                        "apptt": $scope.zcfpInfo.plantime,// 任务执行日期
                        "dispdt": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),// 派工日期
                        "fldtskid": $scope.zcfpInfo.fldtskid,// 现场任务标识
                        "fldtsktyp": $scope.zcfpInfo.fldtsktyp,// 现场任务标识
                        "oprtr": rybs,
                        "wkordrno": $scope.zcfpInfo.wkordrno,// 工作单编号
                        "wkpsnlno": $scope.zcfpInfo.leader // 裝拆人員
                    }
                ]
            };
            if (!navigator.onLine) {
                // 没有网络
                saveZcfpOffline(param);
                return;
            }
            hyMui.loaderShow();
            zcgdfpService.saveZcfpOrderInfo(param).then(function (data) {
                hyMui.loaderHide();
                if (data.rslt === '0') {
                    saveFlag = true;
                    order.orderType = '1';// 工单状态，1.已保存 2.已传递
                    order.offLineState = false;// 非离线工单
                    order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                    var orderInfo = {
                        zcfpInfo: $scope.zcfpInfo
                    };
                    PassOrderService.savePassOrder(orderInfo, order);
                    // 刪除此工单入参本地数据
                    OfflineParamService.delOfflineParam(task.wkordrno);
                    hyMui.alert('保存成功')
                } else {
                    hyMui.alert('保存失敗')
                }
            }, function () {
                saveZcfpOffline(param);
                hyMui.loaderHide();
            });
        };

        function saveZcfpOffline(param) {
            var orderInfo = {
                zcfpVo: $scope.zcfpInfo
            };
            OrderCommonService.saveOrderAndParam(orderInfo, order, param);
        }

        /**
         * 傳遞方法
         * @returns {boolean}
         */
        $scope.send = function () {
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
                position = {jd: $scope.zcfpInfo.long1, wd: $scope.zcfpInfo.lati1}
            } else {
                position = {
                    jd: order.lon,
                    wd: order.lati,
                    supppntno: $scope.zcfpInfo.supppntno,
                    lowvoltequityp: $scope.zcfpInfo.lowvoltequityp
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

        /**
         * 跳转到查询人员信息
         */
        $scope.toQueryInfo = function () {
            mainNavi.pushPage("pages/common/cxgn/cem_ryxx.html", {
                cancelIfRunning: true
            })
        };

        /**
         * 接收人員名稱
         */
        $scope.$on('CEMYDZY_RYXX', function (ev, item) {
            $scope.zcfpInfo.leader = item.loginId;
            $scope.zcfpInfo.leaderMc = item.personName
        });
    }]);