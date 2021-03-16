/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/12
 * 安全隱患現場檢查工單辦理
 */
app.controller("aqyhgdblCtrl", ['$scope', 'TaskService', 'systemDropList', '$appConfig', '$filter', 'aqyhjcService', 'ToolService', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, TaskService, systemDropList, $appConfig, $filter, aqyhjcService, ToolService, $rootScope, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        $scope.orderType = order.orderType;
        $scope.jcxmXzList = [];//检查项目列表  用戶新增
        $scope.flag = false;//默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; //默認中文圖標顯示
        $scope.zgbzDrop = []; //整改標志
        $scope.tzfsDrop = [{//通知方式下拉
            DMBMMC: "信件",
            DMBM: "01"
        }, {
            DMBMMC: "通告",
            DMBM: "02"
        }]; //是否下拉
        $scope.gzjgDrop = [{
            DMBMMC: "合格",
            DMBM: "01"
        }, {
            DMBMMC: "不合格",
            DMBM: "00"
        }]; //工作結果下拉

        /**
         * 初始化方法
         * 根据环节号和工单号查询办理信息
         * @returns
         */
        function init() {
            systemDropList.getDropInfoList('MODFLGCD').then(function (list) {
                $scope.zgbzDrop = list || [];
            });
            $scope.jcxmXzList = [];
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.aqyhjcInfo = orderInfo.aqyhjcInfo || {};
                        $scope.jcxmList = orderInfo.jcxmList || [];
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getAqyhjcOfflineOrder('local');
                    } else {
                        var param = {
                            "wkflwtachno": task.wkflwtachno,
                            "wkordrno": task.wkordrno
                        };
                        hyMui.loaderShow();
                        aqyhjcService.queryAqyhjcOrderInfo(param).then(function (data) {
                            hyMui.loaderHide();
                            data.infoVo.asseno = $filter('shortenNumber')(data.infoVo.asseno);// 去零
                            data.infoVo.cntracctno = $filter('shortenNumber')(data.infoVo.cntracctno);// 去零
                            $scope.aqyhjcInfo = data.infoVo;// 基本信息
                            systemDropList.getDropLable('GISTYPECD', $scope.aqyhjcInfo.lowvoltequityp).then(function (label) {
                                label = label || '';
                                var supppntno = $scope.aqyhjcInfo.supppntno || '';
                                $scope.aqyhjcInfo.supppntno = label + supppntno;
                            });
                            $scope.jcxmList = data.jcxmList;// 檢查項目
                            // 如果结论不存在则默认否
                            $scope.jcxmList.forEach(function (item) {
                                if (!item.chkitmconc || item.chkitmconc !== '1') item.chkitmconc = '0';
                            });
                            if (!$scope.aqyhjcInfo.inspttm) {
                                // 檢查日期默認當前時間
                                $scope.aqyhjcInfo.inspttm = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                            }
                        }, function () {
                            getAqyhjcOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function getAqyhjcOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    $scope.aqyhjcInfo = orderInfo.aqyhjcInfo;// 基本信息
                    $scope.aqyhjcInfo.asseno = $filter('shortenNumber')($scope.aqyhjcInfo.asseno);// 去零
                    $scope.aqyhjcInfo.cntracctno = $filter('shortenNumber')($scope.aqyhjcInfo.cntracctno);// 去零
                    $scope.jcxmList = orderInfo.jcxmList;// 檢查項目
                    // 如果结论不存在则默认否
                    $scope.jcxmList.forEach(function (item) {
                        if (!item.chkitmconc || item.chkitmconc !== '1') item.chkitmconc = '0';
                    });
                    if (!$scope.aqyhjcInfo.inspttm) {
                        // 檢查日期默認當前時間
                        $scope.aqyhjcInfo.inspttm = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                    }
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        /**
         * 保存方法
         * @returns {boolean}
         */
        $scope.save = function () {
            if (!$scope.aqyhjcInfo.insptcnclu) {
                hyMui.alert("請選擇檢查結果");
                return;
            }
            var jcxmConcat = $scope.jcxmList.concat($scope.jcxmXzList); // 新增的检查和系统中的检查拼接
            for (var i = 0; i < jcxmConcat.length; i++) {
                if (!jcxmConcat[i].chkitmconc) {
                    hyMui.alert("請選擇檢查項目結論!");
                    return;
                }
                if (jcxmConcat[i].chkitmconc === '0') {
                    jcxmConcat[i].rema = '';
                }
            }
            var param = {
                "appFldtskVO": {
                    "fldtskid": $scope.aqyhjcInfo.fldtskid,
                    "insptcnclu": $scope.aqyhjcInfo.insptcnclu,
                    "insptrslt": $scope.aqyhjcInfo.insptrslt,
                    "inspttm": $scope.aqyhjcInfo.inspttm,
                    "modflg": $scope.aqyhjcInfo.modflg,
                    "modnotemde": $scope.aqyhjcInfo.modnotemde,
                    "operatorid": rybs,
                    "wkordrno": $scope.aqyhjcInfo.wkordrno,
                    "wkpsnlno": rybs  // 检查人员
                },
                "appInsptitmrecVOList": jcxmConcat
            };
            //预约信息允许为空
            if ($scope.aqyhjcInfo.apptbegtm && $scope.aqyhjcInfo.apptendtm && $scope.aqyhjcInfo.ctctpers && $scope.aqyhjcInfo.wkordrtele) {
                if (ToolService.isTimeBefore($scope.aqyhjcInfo.apptbegtm, $scope.aqyhjcInfo.apptendtm)) {
                    hyMui.alert('預約結束時間不能小於預約開始時間');
                    return;
                }
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                    return;
                }
                param.appSevapptVO = {
                    "apptbegtm": $scope.aqyhjcInfo.apptbegtm,
                    "apptendtm": $scope.aqyhjcInfo.apptendtm,
                    "apptrec": '',//预约内容记录
                    "cntracctno": $filter('lengthenNumber')(12, $scope.aqyhjcInfo.cntracctno),
                    "ctctpers": $scope.aqyhjcInfo.ctctpers,
                    "oprtr": rybs,
                    "sevapptid": $scope.aqyhjcInfo.sevapptid,
                    "sevappttyp": '05',//  服务预约类型
                    "wkordrno": $scope.aqyhjcInfo.wkordrno,
                    "wkordrtele": $scope.aqyhjcInfo.wkordrtele
                };
            }
            if (!navigator.onLine) {
                saveAqyhjcOffline(param);
                return;
            }
            hyMui.loaderShow();
            aqyhjcService.saveAqyhjcOrderInfo(param).then(function (data) {
                if (data.rslt === '0') {
                    saveFlag = true;
                    order.orderType = '1';// 工单状态，1.已保存 2.已传递
                    order.offLineState = false;// 非离线工单
                    order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                    //上传照片
                    TaskService.uploadYjfkPicNew(photoKey).then(function (res) {
                        hyMui.loaderHide();
                        var orderInfo = {
                            aqyhjcInfo: $scope.aqyhjcInfo,
                            jcxmList: $scope.jcxmList
                        };
                        PassOrderService.savePassOrder(orderInfo, order); // 本地緩存传递工单数据
                        // 刪除此工单入参本地数据
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        hyMui.alert('保存成功');
                    }, function () {
                        saveAqyhjcOffline(null);
                        hyMui.loaderHide();
                        hyMui.alert('圖片上傳中斷');
                    });
                    // hyMui.alert('保存成功');
                    // init();
                } else {
                    hyMui.loaderHide();
                    hyMui.alert('保存失敗')
                }
            }, function () {
                saveAqyhjcOffline(param);
                hyMui.loaderHide();
            });
        };

        function saveAqyhjcOffline(param) {
            var orderInfo = {
                aqyhjcInfo: $scope.aqyhjcInfo,
                jcxmList: $scope.jcxmList
            };
            OrderCommonService.saveOrderAndParam(orderInfo, order, param, photoKey);
        }

        /**
         * 检查项目添加新的检查项目
         * @returns {boolean}
         */
        $scope.AddXm = function () {
            var resXm = {
                "chkitmconc": "",
                "chkitmnm": "",
                "chkitmcd": "APPADD",
                "insptitmrecid": "",
                "rema": ""
            };
            $scope.jcxmXzList.unshift(resXm);
        };

        /**
         * 删除新添加的检查项目
         * @returns {boolean}
         */
        $scope.delXm = function (index) {
            $scope.jcxmXzList.splice(index, 1);
        };

        /**
         * 传递
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
                position = {jd: $scope.aqyhjcInfo.long1, wd: $scope.aqyhjcInfo.lati1}
            } else {
                position = {
                    jd: order.lon,
                    wd: order.lati,
                    supppntno: $scope.aqyhjcInfo.supppntno,
                    lowvoltequityp: $scope.aqyhjcInfo.lowvoltequityp
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

        $scope.savePhoto = function () {
            var uploadFlag = $scope.photoList.some(function (item) {
                return item._data.ISUPLOAD === '0';
            });
            if (!uploadFlag) {
                hyMui.alert('暫無照片上傳');
                return;
            }
            if (!navigator.onLine) {
                hyMui.alert('照片本地保存成功');
            } else {
                hyMui.loaderShow();
                TaskService.uploadYjfkPicNew(photoKey).then(function (res) {
                    hyMui.loaderHide();
                    hyMui.alert('照片上傳成功');
                }, function () {
                    hyMui.loaderHide();
                    hyMui.alert('照片本地保存成功');
                });
            }
        };

        /********************** 附件相关 Start****************************/
        //上传图片集合
        $scope.photoList = [];
        var photoKey = "aqyhjc" + task.wkordrno;

        /**
         * 附件初始化
         */
        function initFileList() {
            $scope.photoList = [];
            var task = {};
            TaskService.getFileByTask(task, {key: 'ONLYBS', value: photoKey}).then(function (list) {
                $scope.photoList = list || [];
            });
        }

        initFileList();
        /**
         * 选择照相或相册相片
         */
        $scope.selectPicture = function ($callback) {
            var task = {
                GZDBH: $scope.aqyhjcInfo.wkordrno,  //计划标识
                RWH: '',  //任务号
                YWLX: 'workOrder',  //类型
                ENABLED: '1',
                YWCLR: $appConfig.userInfo.RYBS,
                ONLYBS: photoKey
            };
            var options = {
                success: $callback
            };
            TaskService.selectFile(task, options);
        };
        /**
         * 判断是否可删除
         * @param $item
         * @returns {boolean}
         */
        $scope.canDelFile = function ($item) {
            return $item.ISUPLOAD !== '1';
        };
        /**
         * 删除图片
         * @param $index
         * @param $item
         * @param $done
         */
        $scope.deletePhoto = function ($index, $item, $done) {
            hyMui.confirm({
                title: '',
                message: '確認刪除此照片？',
                buttonLabels: ['否', '是'],
                callback: function (index) {
                    if (index === 0) return;
                    TaskService.deleteFile($item).then(function () {
                        $done();
                        $scope.$evalAsync();
                    });
                }
            });
        };

        /**
         * 預約電話格式校驗
         */
        function isPhone() {
            var phoneReg = /^[0-9]*$/;
            if (phoneReg.test($scope.aqyhjcInfo.wkordrtele)) {
                return true;
            } else {
                return false;
            }
        }

        $scope.check = function () {
            if ($scope.aqyhjcInfo.wkordrtele) {
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                }
            }

        };
        /**
         * 跳轉到附件列表
         * @returns {boolean}
         */
        $scope.toFileList = function () {
            mainNavi.pushPage('pages/cemydzy/xcjcbl/cem_fileList.html', {
                cancelIfRunning: true,
                wkordrno: $scope.aqyhjcInfo && $scope.aqyhjcInfo.wkordrno
            })
        };

        /**
         * 预约开始时间大于预约结束时间
         * @param newDate
         * @param oldDate
         * @param fromFlag
         * @param compareDate
         */
        $scope.changeDate = function (newDate, oldDate, fromFlag, compareDate) {
            if (fromFlag === 'end') {
                if (ToolService.isTimeBefore(compareDate, newDate)) {
                    hyMui.alert('預約結束時間不能小於預約開始時間', function () {
                        endTime.onShow();
                    });
                }
            } else {
                if (ToolService.isTimeBefore(newDate, compareDate)) {
                    hyMui.alert('預約結束時間不能小於預約開始時間', function () {
                        beginTime.onShow();
                    });
                }
            }
        };
    }]);