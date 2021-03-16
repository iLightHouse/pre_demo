/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/10
 * 現場檢查任務辦理
 */
app.controller("xcjcrwblCtrl", ['$scope', '$onsen', 'TaskService', '$appConfig', '$filter', 'xcjcService', '$rootScope', 'PassOrderService', 'systemDropList', 'OfflineOrderService', 'OfflineParamService', 'ToolService', 'OrderCommonService', 'OrderMapService',
    function ($scope, $onsen, TaskService, $appConfig, $filter, xcjcService, $rootScope, PassOrderService, systemDropList, OfflineOrderService, OfflineParamService, ToolService, OrderCommonService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        $scope.orderType = order.orderType;
        $scope.jcxmXzList = [];//检查项目列表  用戶新增
        $scope.flag = false;//默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; //默認中文圖標顯示
        $scope.wkflowstdtaskno = task.wkflowstdtaskno;// 标准环节号
        $scope.apsDrop = [];
        systemDropList.getDropInfoList('PHASTYPCD').then(function (list) {
            $scope.xwDrop = list;
        });
        if($scope.wkflowstdtaskno=='1169'||$scope.wkflowstdtaskno=='1171'){
            // 安培數
            systemDropList.getDropInfoList('FUSEAPCD').then(function (list) {
                $scope.apsDrop = list || [];
            });
        }


        /**
         * 初始化方法
         * @returns
         */
        function init(initFlag) {
            $scope.jcxmXzList = [];
            $scope.zysbList = [];
            $scope.zysbList.push({
                sbmc:'电焊机',
                rl:'10',
                ts:'1'
            }/*,{
                sbmc:'照明',
                rl:'0.3',
                ts:'10'
            },{
                sbmc:'水泵',
                rl:'35',
                ts:'1'
            }*/);
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.xcjcInfo = orderInfo.xcjcInfo || {};
                        $scope.jcxmList = orderInfo.jcxmList || [];
                        if (orderInfo.jcxmXzList && orderInfo.jcxmXzList.length > 0) {
                            Array.prototype.push.apply($scope.jcxmList, orderInfo.jcxmXzList);
                        }
                        $scope.zysbList.push({
                            sbmc:'电焊机',
                            rl:'10',
                            ts:'1'
                        },{
                            sbmc:'照明',
                            rl:'0.3',
                            ts:'10'
                        },{
                            sbmc:'水泵',
                            rl:'35',
                            ts:'1'
                        });
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno).then(function (result) {
                    if ((result || !navigator.onLine) && !initFlag) {
                        getXcjcOfflineOrder('local');
                    } else {
                        var param = {
                            "wkflwtachno": task.wkflwtachno,
                            "wkordrno": task.wkordrno
                        };
                        hyMui.loaderShow();
                        xcjcService.queryXcjcOrderInfo(param).then(function (data) {
                            hyMui.loaderHide();
                            $scope.xcjcInfo = data.infoVo || {};
                            $scope.xcjcInfo.asseno = $filter('shortenNumber')($scope.xcjcInfo.asseno);// 去零
                            systemDropList.getDropLable('GISTYPECD', $scope.xcjcInfo.lowvoltequityp).then(function (label) {
                                label = label || '';
                                var supppntno = $scope.xcjcInfo.supppntno || '';
                                $scope.xcjcInfo.supppntno = label + supppntno;
                            });
                            $scope.jcxmList = data.jcxmList || [];
                            // 如果结论不存在则默认否
                            $scope.jcxmList.forEach(function (item) {
                                if (!item.inspconc || item.inspconc !== '1') item.inspconc = '0';
                            });
                            if (!$scope.xcjcInfo.veridt) {
                                $scope.xcjcInfo.veridt = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                            }
                            // 翻译业务类别代码
                            $scope.xcjcInfo.buscatgcdMc = translateDmfl($scope.xcjcInfo.buscatgcd);
                            // 照片上传失败，保存工单信息至本地
                            if (initFlag === 'photoFail') {
                                saveXcjcOffline(null);
                            }
                        }, function () {
                            // 照片上传失败，保存工单信息至本地
                            if (initFlag === 'photoFail') {
                                saveXcjcOffline(null);
                            }
                            getXcjcOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function getXcjcOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    $scope.xcjcInfo = orderInfo.xcjcInfo || {};
                    $scope.xcjcInfo.asseno = $filter('shortenNumber')($scope.xcjcInfo.asseno);// 去零
                    $scope.jcxmList = orderInfo.jcxmList || [];
                    // 如果结论不存在则默认否
                    $scope.jcxmList.forEach(function (item) {
                        if (!item.inspconc || item.inspconc !== '1') item.inspconc = '0';
                    });
                    // 新增項目数组有数据，则向旧数组就添加进去
                    if (orderInfo.jcxmXzList && orderInfo.jcxmXzList.length > 0) {
                        Array.prototype.push.apply($scope.jcxmList, orderInfo.jcxmXzList);
                    }
                    if (!$scope.xcjcInfo.veridt) {
                        $scope.xcjcInfo.veridt = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    }
                    // 翻译业务类别代码
                    $scope.xcjcInfo.buscatgcdMc = translateDmfl($scope.xcjcInfo.buscatgcd);
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        $scope.sfDrop = [{
            DMBMMC: "是",
            DMBM: "1"
        }, {
            DMBMMC: "否",
            DMBM: "0"
        }]; //是否下拉`
        $scope.gzjgDrop = [{
            DMBMMC: "通過",
            DMBM: "1"
        }, {
            DMBMMC: "不通過",
            DMBM: "2"
        }]; //工作結果下拉，改成跟pc端保持一致

        /**
         * 检查项目添加新的检查项目
         * @returns {boolean}
         */
        $scope.AddXm = function () {
            var resXm = {
                inspconc: '1',
                itmnm: '',
                projinspitmid: '',
                remark: ''
                /*"changeflag": "string",*/
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
         * 保存方法
         * @returns {boolean}
         */
        $scope.save = function () {
            if ($scope.xcjcInfo.wkordrtele) {
                if (!isPhone()) {
                    hyMui.alert("請輸入數字類型的預約電話");
                    return;
                }
            }
            // 拼接检查项目，如果选择的是合格，则清空不合格原因字段
            var jcxmConcat = $scope.jcxmList.concat($scope.jcxmXzList);
            if (jcxmConcat.length == 0) {
                hyMui.alert("請添加檢查項目");
                return;
            }
            for (var i = 0; i < jcxmConcat.length; i++) {
                if (!jcxmConcat[i].inspconc) {
                    hyMui.alert("請選擇檢查項目結論!");
                    return;
                }
                if (!jcxmConcat[i].itmnm) {
                    hyMui.alert("請輸入檢查項目名稱!");
                    return;
                }
                if (jcxmConcat[i].inspconc === '0') {
                    jcxmConcat[i].remark = '';
                }
            }
            var param = {
                "list": jcxmConcat,
                "vo": {
                    "asseno": $filter('lengthenNumber')(18, $scope.xcjcInfo.asseno),
                    "eeno": '',// 检查人员编号
                    "inspconc": $scope.xcjcInfo.inspconc,// 檢查結果
                    "oprtr": rybs,
                    "phastyp": $scope.xcjcInfo.asseno ? $scope.xcjcInfo.phasln : "",// 如果电表号为空，则相位赋空值
                    "prjtclasscd": $scope.xcjcInfo.wkordrno,// 未知待确认
                    "remark": $scope.xcjcInfo.remark,// 检查记录
                    "veridt": $scope.xcjcInfo.veridt,// 检查日期
                    "wkflowtaskno": task.wkflowtaskno,// 任务号
                    "wkordrno": $scope.xcjcInfo.wkordrno,
                    "fusereplflg": $scope.xcjcInfo.fusereplflg,
                    "amp": $scope.xcjcInfo.amp
                }
            };
            //预约信息允许为空
            if ($scope.xcjcInfo.apptbegtm && $scope.xcjcInfo.apptendtm && $scope.xcjcInfo.ctctpers && $scope.xcjcInfo.wkordrtele) {
                if (ToolService.isTimeBefore($scope.xcjcInfo.apptbegtm, $scope.xcjcInfo.apptendtm)) {
                    hyMui.alert('預約結束時間不能小於預約開始時間');
                    return;
                }
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                    return;
                }
                param.appSevapptVo = {
                    "apptbegtm": $scope.xcjcInfo.apptbegtm,
                    "apptendtm": $scope.xcjcInfo.apptendtm,
                    "apptrec": '',// 预约内容记录
                    "cntracctno": $filter('lengthenNumber')(12, $scope.xcjcInfo.cntracctno),
                    "ctctpers": $scope.xcjcInfo.ctctpers,
                    "oprtr": rybs,
                    "sevapptid": $scope.xcjcInfo.sevapptid,// 服务预约唯一标识
                    "sevappttyp": '04',// 未知
                    "wkordrno": $scope.xcjcInfo.wkordrno,
                    "wkordrtele": $scope.xcjcInfo.wkordrtele
                };
            }
            if (!navigator.onLine) {
                // 没有网络
                saveXcjcOffline(param);
                // 1.工单信息保存至本地数据库
                /*OfflineOrderService.saveOfflineOrder(orderInfo, order);
                // 2.保存入参保存至本地数据库
                OfflineParamService.saveOfflineParam(param, order);
                // 3.緩存照片photoKey
                ToolService.saveLocalPhotoKey(photoKey);
                // 4.工单移动
                order.orderType = '1';// 工单状态，1.已保存 2.已传递
                order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                hyMui.alert('本地數據保存成功');*/
                return;
            }
            hyMui.loaderShow();
            xcjcService.saveXcjcOrderInfo(param).then(function (data) {
                if (data.rslt === '0') {
                    var orderInfo = {
                        xcjcInfo: $scope.xcjcInfo,
                        jcxmList: $scope.jcxmList,
                        jcxmXzList: angular.copy($scope.jcxmXzList)
                    };
                    //上传照片
                    TaskService.uploadYjfkPicNew(photoKey).then(function (res) {
                        hyMui.loaderHide();
                        PassOrderService.savePassOrder(orderInfo, order);
                        saveFlag = true;
                        order.orderType = '1';// 工单状态，1.已保存 2.已传递
                        order.offLineState = false;// 非离线工单
                        order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                        // 刪除此工单入参本地数据
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        init(true);
                        hyMui.alert('保存成功');
                    }, function () {
                        hyMui.loaderHide();
                        init('photoFail');
                        hyMui.alert('圖片上傳中斷');
                    });
                    // hyMui.alert('保存成功');
                } else {
                    hyMui.loaderHide();
                    hyMui.alert('保存失敗');
                }
            }, function () {
                saveXcjcOffline(param);
                hyMui.loaderHide();
            });
        };

        function saveXcjcOffline(param) {
            var orderInfo = {
                xcjcInfo: $scope.xcjcInfo,
                jcxmList: $scope.jcxmList,
                jcxmXzList: $scope.jcxmXzList
            };
            OrderCommonService.saveOrderAndParam(orderInfo, order, param, photoKey);
        }

        /**
         * 跳轉到電力技術要求單
         * @returns {boolean}
         */
        $scope.Todljs = function () {
            mainNavi.pushPage('pages/cemydzy/dljs/cemydzy_dlzzjsyq.html', {
                cancelIfRunning: true,
                jbxx: $scope.xcjcInfo,
                orderType: order.orderType // 工单状态，2 已传递则无法保存
            })
        };

        /**
         * 跳轉到附件列表
         * @returns {boolean}
         */
        $scope.toFileList = function () {
            mainNavi.pushPage('pages/cemydzy/xcjcbl/cem_fileList.html', {
                cancelIfRunning: true,
                wkordrno: $scope.xcjcInfo && $scope.xcjcInfo.wkordrno
            })
        };

        /**
         * 传递
         * @returns {boolean}
         */
        $scope.send = function () {
            // order.orderType = '2';// 工单状态，1.已保存 2.已传递
            // order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
            // $rootScope.$broadcast("CHANGE_PASS_ORDER", order);
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

        function translateDmfl(dbbm) {
            var dbbmmc = '';
            switch (dbbm) {
                case 'CCS-CS-01':
                    dbbmmc = '新裝用電-PNC';
                    break;
                case 'CCS-CS-02':
                    dbbmmc = '臨時用電-PCT';
                    break;
                case 'CCS-CS-03':
                    dbbmmc = '功率變更-PAC';
                    break;
                case 'CCS-CS-04':
                    dbbmmc = '功率變更-PAC（無表）';
                    break;
                case 'CCS-CS-05':
                    dbbmmc = '合同終止-PRC';
                    break;
                case 'CCS-CS-11':
                    dbbmmc = '設備拆除-PRIE';
                    break;
                case 'CCS-CS-12':
                    dbbmmc = '重大變更-Major PAF';
                    break;
                case 'CCS-CS-13':
                    dbbmmc = '微小變更-Minor PAF';
                    break;
                case 'CCS-CS-14':
                    dbbmmc = '移動-Move Meter Process';
                    break;
                case 'CCS-CS-30':
                    dbbmmc = '光伏工程';
                    break;
            }
            return dbbmmc;
        }

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
            if (!$scope.xcjcInfo) {
                hyMui.alert('經緯度不存在，無法查看');
                return;
            }
            var position = null;
            if (flag === 'equipment') {
                position = {jd: $scope.xcjcInfo.long1, wd: $scope.xcjcInfo.lati1}
            } else {
                position = {
                    jd: order.lon,
                    wd: order.lati,
                    supppntno: $scope.xcjcInfo.supppntno,
                    lowvoltequityp: $scope.xcjcInfo.lowvoltequityp
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
        var photoKey = "xcjc" + task.wkordrno;

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
                GZDBH: $scope.xcjcInfo.wkordrno,  //计划标识
                RWH: '',  //任务号
                YWLX: 'workOrder',  //类型
                ENABLED: '1',
                YWCLR: rybs,
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
        // 判断是否为手机号
        function isPhone() {
            var phoneReg = /^[0-9]*$/;
            if (phoneReg.test($scope.xcjcInfo.wkordrtele)) {
                return true;
            } else {
                return false;
            }
        }

        $scope.check = function () {
            if ($scope.xcjcInfo.wkordrtele) {
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                }
            }

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