/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/28
 * 批量裝拆錄入
 */
app.controller("cemPlzclrCtrl", ['$scope', '$appConfig', '$rootScope', 'PassOrderService', 'zcgdblsService', 'OfflineOrderService', 'OfflineParamService',
    function ($scope, $appConfig, $rootScope, PassOrderService, zcgdblsService, OfflineOrderService, OfflineParamService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var orders = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var apiData = null;// 接口返回数据
        var premNoBz = null;// 任务唯一标识
        var passBljmData = [];
        $scope.resultList = [];// 任务列表
        $scope.orderType = orders.orderType;

        function init() {
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(orders.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        orderInfo.forEach(function (item) {
                            $scope.resultList.push(item.rwlb);
                            passBljmData.push(item.bljm);
                        })
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(orders.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getPlzcOfflineInfo('local');
                    } else {
                        var wkor = {
                            "wkordrno": task.wkordrno
                        };
                        hyMui.loaderShow();
                        zcgdblsService.queryZcgdblOrderInfo(wkor, 'pllr').then(function (data) {
                            hyMui.loaderHide();
                            dealCommonOrder(data);
                        }, function () {
                            getPlzcOfflineInfo('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function dealCommonOrder(data) {
            // 房产去重，构建任务列表
            var pllrList = [];
            data.infoVo.forEach(function (item) {
                // 统计同一房产下的计量点编号
                var meteAry = [];
                item.metepntno ? meteAry.push(item.metepntno) : null;
                item.metepntno = meteAry;
                var exist = pllrList.some(function (value) {
                    if (value.premno === item.premno) {
                        item.metepntno.length > 0 ? value.metepntno.push(item.metepntno[0]) : null;
                    }
                    return value.premno === item.premno
                });
                !exist ? pllrList.push(item) : null;
            });
            data.infoVo = pllrList;
            apiData = data;
            $scope.resultList = data.infoVo;
        }

        /**
         * 获取离线缓存界面数据
         */
        function getPlzcOfflineInfo(state) {
            OfflineOrderService.getOfflineOrder(orders.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    orderInfo.forEach(function (item) {
                        $scope.resultList.push(item.rwlb);
                        passBljmData.push(item.bljm);
                    });
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        /**
         * 跳转装拆录入界面
         * @param value 房产编号
         * @param meteNo 计量点Ary
         */
        $scope.toPllrOrder = function (value, meteNo) {
            premNoBz = value;
            var copyApiData = null;
            var offlineTaskList = null;// 离线工单任务数组
            if ($scope.orderType === '2' || $scope.netWorkStatus) {
                passBljmData.some(function (item) {
                    if (item.premno === value) {
                        copyApiData = item;
                        return true;
                    }
                });
            } else {
                // 非传递工单
                var passInfoVo = filterOrder('infoVo');
                var passMcbList = filterOrder('mcbList');
                var passMtrList = filterOrder('mtrList');
                var passInduList = filterOrder('induList');
                var passSealList = dealLock(meteNo);// 处理锁信息
                copyApiData = angular.copy(apiData);
                copyApiData.infoVo = passInfoVo.length > 0 ? passInfoVo[0] : {};
                copyApiData.mcbList = passMcbList;
                copyApiData.mtrList = passMtrList;
                copyApiData.induList = passInduList;
                copyApiData.sealList = passSealList;
                // 用于无网或网络异常时，保存各个任务本地数据
                offlineTaskList = createTaskList(value);
            }
            orders.premno = value;// 添加房产编号
            mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                cancelIfRunning: true,
                task: task,
                order: orders,// 用于修改工单状态
                data: copyApiData,// 原始数据/传递数据/本地缓存数据
                fromPage: 'pllr',
                network: $scope.netWorkStatus,// 离线标志
                offlineTaskList: offlineTaskList// 任务列表
            });
        };

        function filterOrder(type) {
            return apiData[type].filter(function (item) {
                if (item.premno === premNoBz) return true
            });
        }

        /**
         * 处理锁信息，统计计量点编号对应的锁信息
         * @param lockAry
         * @returns {Array}
         */
        function dealLock(lockAry) {
            var lockList = apiData.sealList || [];
            var filterLockList = [];
            lockAry.forEach(function (item) {
                for (var i = 0; i < lockList.length; i++) {
                    if (item === lockList[i].metepntno) {
                        filterLockList.push(lockList[i]);
                    }
                }
            });
            return filterLockList;
        }

        /**
         * 批量装拆任务列表（除去当前点击项）
         * @param delPre
         * @returns {Array}
         */
        function createTaskList(delPre) {
            // 去除需要办理的任务
            var taskList = [];
            $scope.resultList.forEach(function (item) {
                if (item.premno !== delPre) {
                    premNoBz = item.premno;
                    var passInfoVo = filterOrder('infoVo');
                    var passMcbList = filterOrder('mcbList');
                    var passMtrList = filterOrder('mtrList');
                    var passInduList = filterOrder('induList');
                    var passSealList = dealLock(item.metepntno);// 处理锁信息
                    var taskApiData = angular.copy(apiData);
                    taskApiData.infoVo = passInfoVo.length > 0 ? passInfoVo[0] : {};
                    taskApiData.mcbList = passMcbList;
                    taskApiData.mtrList = passMtrList;
                    taskApiData.induList = passInduList;
                    taskApiData.sealList = passSealList;
                    var rwlb = {
                        wkordrno: orders.wkordrno,
                        contractno: orders.contractno,
                        premno: premNoBz
                    };
                    var task = {
                        rwlb: rwlb,
                        bljm: taskApiData
                    };
                    taskList.push(task);
                }
            });
            return taskList;
        }
    }]);