/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/15
 * 聯合檢查辦理
 */
app.controller("cemlhjcCtrl", ['$scope', '$onsen', 'TaskService', 'NativeService', '$appConfig', '$filter', 'lhjcService', '$http', '$rootScope', 'systemDropList', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, $onsen, TaskService, NativeService, $appConfig, $filter, lhjcService, $http, $rootScope, systemDropList, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        $scope.orderType = order.orderType;
        //var blsj = mainNavi.getCurrentPage().options.data;
        $scope.lhjcInfo = {};//基本信息
        $scope.yyxx = {};// 預約信息
        $scope.flag = false;// 默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; // 默認中文圖標顯示
        $scope.zclu = false;// 錄入臨時裝拆數據默認不可見
        $scope.xzsList = [];// 新增鎖
        $scope.ccsList = [];// 拆除鎖
        $scope.xzsRList = [];// 新增鎖    查询接口返回原有数据
        $scope.ccsRList = [];// 拆除鎖    查询接口返回原有数据
        var saveFyList = [];// 删除锁的数组


        function init() {
            initData();
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.lhjcInfo = orderInfo.lhjcInfo || {};
                        $scope.xzsRList = orderInfo.xzsRList || [];
                        $scope.ccsRList = orderInfo.ccsRList || [];
                        $scope.xzsList = orderInfo.xzsList || [];
                        $scope.ccsList = orderInfo.ccsList || [];
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getLhjcOfflineOrder('local');
                    } else {
                        var param = {
                            "jointinspectionentityVO": {
                                "wkflwtachno": task.wkflwtachno,
                                "wkordrno": task.wkordrno
                            },
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 100
                            }
                        };
                        hyMui.loaderShow();
                        lhjcService.queryLhjcOrderInfo(param).then(function (data) {
                            hyMui.loaderHide();
                            data.infoVo.meterno = $filter('shortenNumber')(data.infoVo.meterno);// 去零
                            data.infoVo.contractno = $filter('shortenNumber')(data.infoVo.contractno);// 去零
                            $scope.lhjcInfo = data.infoVo;// 基本信息
                            systemDropList.getDropLable('GISTYPECD', $scope.lhjcInfo.lowvoltequityp).then(function (label) {
                                label = label || '';
                                var supppntno = $scope.lhjcInfo.supppntno || '';
                                $scope.lhjcInfo.supppntno = label + supppntno;
                            });
                            $scope.lhjcInfo.principal = rybs;
                            $scope.lhjcInfo.principalMC = $appConfig.getUserInfo().RYMC;
                            if (!$scope.lhjcInfo.checktime) {
                                $scope.lhjcInfo.checktime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');// 默認當前日期
                            }
                            var params = {
                                "pageInfo": {
                                    "allPageNum": 0,
                                    "allRowNum": 0,
                                    "curPageNum": 1,
                                    "rowOfPage": 100
                                },
                                "vo": {
                                    "metepntno": $scope.lhjcInfo.metepntno,
                                    "wkordrno": $scope.lhjcInfo.wkordrno
                                }
                            };
                            hyMui.loaderShow();
                            lhjcService.queryLhjcLockInfo(params).then(function (data) {
                                hyMui.loaderHide();
                                zhLockInfo(data.voList);
                            }, function () {
                                hyMui.loaderHide();
                            });
                        }, function () {
                            getLhjcOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function getLhjcOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    if (orderInfo.flag === 'init') {
                        // 未点击过保存的初始化
                        orderInfo.infoVo.meterno = $filter('shortenNumber')(orderInfo.infoVo.meterno);// 去零
                        orderInfo.infoVo.contractno = $filter('shortenNumber')(orderInfo.infoVo.contractno);// 去零
                        $scope.lhjcInfo = orderInfo.infoVo;// 基本信息
                        $scope.lhjcInfo.principal = rybs;
                        $scope.lhjcInfo.principalMC = $appConfig.getUserInfo().RYMC;
                        if (!$scope.lhjcInfo.checktime) {
                            $scope.lhjcInfo.checktime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');// 默認當前日期
                        }
                        // 组合锁信息
                        zhLockInfo(orderInfo.voList);
                    } else {
                        // 保存过的初始化，直接复制$scope对象
                        $scope.lhjcInfo = orderInfo.lhjcInfo || {};
                        $scope.xzsRList = orderInfo.xzsRList || [];
                        $scope.ccsRList = orderInfo.ccsRList || [];
                        $scope.xzsList = orderInfo.xzsList || [];
                        $scope.ccsList = orderInfo.ccsList || [];
                    }
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        /**
         * 组合锁信息
         * @param sysList
         */
        function zhLockInfo(sysList) {
            for (var i = 0; i < sysList.length; i++) {
                /*switch (sysList[i].sealequicate) {
                    case '01':
                        sysList[i].sealequicateMc = '電能表';
                        break;
                    case '02':
                        sysList[i].sealequicateMc = '互感器';
                        break;
                    case '03':
                        sysList[i].sealequicateMc = '計量點';
                        break;
                }*/
                sysList[i].sealno = $filter('shortenNumber')(sysList[i].sealno);// 去零
                if (sysList[i].sealasseno) {
                    sysList[i].sealasseno = $filter('shortenNumber')(sysList[i].sealasseno);// 去零
                }
                !function (i) {
                    // 翻译加封位置
                    systemDropList.getDropLable('SEALLOCCD', sysList[i].sealloc).then(function (label) {
                        sysList[i].seallocMc = label || sysList[i].sealloc;
                    });
                    // 翻译加封對象
                    systemDropList.getDropLable('SEALEQUICATECD', sysList[i].sealequicate).then(function (label) {
                        sysList[i].sealequicateMc = label || sysList[i].sealequicate;
                    });
                }(i);
                if ('10' === sysList[i].chghsttyp) { //目前按照10 新装  15 拆除的逻辑
                    $scope.xzsRList.push(sysList[i]);
                } else if ('15' === sysList[i].chghsttyp) {//拆除
                    $scope.ccsRList.push(sysList[i]);
                }
            }
        }


        /**
         * 添加鎖號
         * @constructor
         */
        /*$scope.AddSh = function (flag) {
            mainNavi.pushPage('pages/cemydzy/tdbl/cem_xzsh.html', {
                cancelIfRunning: true,
                flag: flag
            })
        };*/

        /**
         * 添加鎖號
         */
        $scope.addNewLock = function () {
            $scope.xzsList.unshift({
                oprtr: rybs,
                seal: rybs,// 加封人
                sealasseno: "",// 資產編號
                sealcolo: "",
                sealequicate: "",// 加封對象
                sealirflgcd: "10",// 变更标志
                sealloc: "",// 加封位置
                sealno: "",// 鎖編號
                sealtm: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),// 加封日期
                sealuse: "02",// 加封用途
                sealuseMc: "裝錶封"
            })
        };

        /**
         * 接收新增鎖信息
         */
        /*$scope.$on('CEMJCXM_XZLHJC', function (ev, item) {
            if ($scope.xzsList.length > 0) {
                for (var i = 0; i < $scope.xzsList.length; i++) {
                    if ($scope.xzsList[i].sealno === item.sealno) {
                        hyMui.alert(item.sealno + '已存在');
                        return
                    }
                }
                translationXl(item);
                // 翻译加封位置
                systemDropList.getDropLable('SEALLOCCD', item.sealloc).then(function (label) {
                    item.jfwzmc = label || item.sealloc;
                });
                $scope.xzsList.unshift(item);
            } else {
                translationXl(item);
                // 翻译加封位置
                systemDropList.getDropLable('SEALLOCCD', item.sealloc).then(function (label) {
                    item.jfwzmc = label || item.sealloc;
                });
                $scope.xzsList.unshift(item);
            }
        });*/

        /**
         * 删除新增鎖號
         * @returns {boolean}
         */
        $scope.delXzsh = function (index) {
            if ($scope.xzsList[index].saveBz) {
                $scope.xzsList[index].changeflag = '2';// 2新装取消
                saveFyList.push($scope.xzsList[index]);
            }
            $scope.xzsList.splice(index, 1);
        };

        /**
         * 删除系统新增鎖號
         * @returns {boolean}
         */
        $scope.delXzshR = function (index) {
            $scope.xzsRList[index].changeflag = '2';// 2新装取消
            saveFyList.push($scope.xzsRList[index]);
            $scope.xzsRList.splice(index, 1);
        };

        /**
         * 添加拆除鎖
         * @constructor
         */
        /*$scope.AddCcs = function (flag) {
            mainNavi.pushPage('pages/cemydzy/tdbl/cem_ccsxx.html', {
                cancelIfRunning: true,
                flag: flag,
                cntracctno: $scope.lhjcInfo.contractno
            })
        };*/

        $scope.addDelLock = function () {
            $scope.ccsList.unshift({
                oprtr: rybs,
                seal: rybs,// 加封人
                sealasseno: "",// 資產編號
                sealcolo: "",
                sealequicate: "",// 加封對象
                sealirflgcd: "15",// 变更标志
                sealloc: "",// 加封位置
                sealno: "",// 鎖編號
                sealtm: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),// 加封日期
                sealuse: ""// 加封用途
            })
        };

        /**
         * 接收拆除鎖信息
         */
        /*$scope.$on('CEMJCXM_CCSXXLH', function (ev, item) {
            var content = '';
            // 传递过来的为数组
            for (var i = 0; i < item.length; i++) {
                if ($scope.ccsList.length > 0) {
                    var res = $scope.ccsList.some(function (ccs) {
                        return ccs.sealno === item[i].sealno;
                    });
                    // 如果不存在锁编号相同的情况则添加，相同则继续循环
                    if (!res) {
                        translationXl(item[i]);// 翻译下拉
                        // 翻译加封位置
                        !function (i) {
                            systemDropList.getDropLable('SEALLOCCD', item[i].sealloc).then(function (label) {
                                item[i].jfwzmc = label || item[i].sealloc;
                            });
                        }(i);
                        $scope.ccsList.unshift(item[i]);
                    } else {
                        content += item[i].sealno + ',';
                    }
                } else {
                    translationXl(item[i]);// 翻译下拉
                    // 翻译加封位置
                    !function (i) {
                        systemDropList.getDropLable('SEALLOCCD', item[i].sealloc).then(function (label) {
                            item[i].jfwzmc = label || item[i].sealloc;
                        });
                    }(i);
                    $scope.ccsList.unshift(item[i]);
                }
            }
            var result = content.substring(0, content.length - 1);
            if (result) {
                hyMui.alert(result + '設備已存在')
            }
        });*/

        /**
         * 删除拆除鎖
         * @returns {boolean}
         */
        $scope.delCcsh = function (index) {
            if ($scope.ccsList[index].saveBz) {
                $scope.ccsList[index].changeflag = '4';// 4拆除取消
                saveFyList.push($scope.ccsList[index]);
            }
            $scope.ccsList.splice(index, 1);
        };

        /**
         * 删除系统中的拆除鎖
         * @returns {boolean}
         */
        $scope.delCcsR = function (index) {
            $scope.ccsRList[index].changeflag = '4';// 4拆除取消
            saveFyList.push($scope.ccsRList[index]);
            $scope.ccsRList.splice(index, 1);
        };

        /**
         * 翻译下拉
         * @param item
         */
        function translationXl(item) {
            switch (item.sealequicate) {
                case '01':
                    item.jfsbmc = '電能表';
                    break;
                case '02':
                    item.jfsbmc = '互感器';
                    break;
                case '03':
                    item.jfsbmc = '計量點';
                    break;
            }
            // 翻译加封位置
            /*systemDropList.getDropLable('SEALLOCCD', item.sealloc).then(function (label) {
                item.jfwzmc = label || item.sealloc;
            });*/
        }

        /**
         * 保存方法
         */
        $scope.save = function () {
            if (!$scope.lhjcInfo.checkresults) {
                hyMui.alert('請填寫檢查結果');
                return;
            }
            var lockAry = saveLock();
            for (var i = 0; i < lockAry.length; i++) {
                if (!lockAry[i].sealno) {
                    hyMui.alert('請錄入鎖編號');
                    return;
                }
            }
            // 存在重複的鎖編號，請重新錄入
            var newAry = $scope.xzsList.concat($scope.xzsRList, $scope.ccsList, $scope.ccsRList);
            var nlockAry = [];
            for (var a = 0; a < newAry.length; a++) {
                var flag = false;
                for (var b = 0; b < nlockAry.length; b++) {
                    if (newAry[a].sealno === nlockAry[b].sealno) {
                        flag = true;
                    }
                }
                if(!flag){
                    nlockAry.push(newAry[a]);
                }
            }
            if(nlockAry.length !== newAry.length){
                hyMui.alert('存在重複的鎖編號，請重新錄入');
                return;
            }
            var param = {
                "list": lockAry,
                "vo": {
                    "cntracctno": $filter('lengthenNumber')(12, $scope.lhjcInfo.contractno),
                    "fldtskid": $scope.lhjcInfo.fldtskid,
                    "fldtsktyp": $scope.lhjcInfo.fldtsktyp,
                    "insptcnclu": $scope.lhjcInfo.checkresults,// 檢查結論
                    "insptrslt": $scope.lhjcInfo.opinion,// 檢查結果描述
                    "inspttm": $scope.lhjcInfo.checktime, // 檢查時間
                    "metepntno": $scope.lhjcInfo.metepntno,// 计量点编号
                    "operatorid": rybs,
                    "wkflowtaskno": task.wkflowtaskno,// 工作流实例中的任务编号
                    "wkordrno": $scope.lhjcInfo.wkordrno,
                    "wkpsnlno": $scope.lhjcInfo.principal // 检查人员
                }
            };
            if (!navigator.onLine) {
                saveLhjcOffline(param);
                return;
            }
            hyMui.loaderShow();
            lhjcService.saveLhjcOrderInfo(param).then(function (data) {
                if (data && data.rslt === '0') {
                    // 处理锁数组相关数据
                    $scope.xzsList.forEach(function (item) {
                        item.saveBz = true;// 标记是否保存过，对于保存过的不再传递后台
                    });
                    $scope.ccsList.forEach(function (item) {
                        item.saveBz = true;// 标记是否保存过，对于保存过的不再传递后台
                    });
                    saveFyList.length = 0;// 保存成功，清除此數組
                    saveFlag = true;
                    order.orderType = '1';// 工单状态，1.已保存 2.已传递
                    order.offLineState = false;// 非离线工单
                    order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                    //上传照片
                    TaskService.uploadYjfkPicNew(photoKey).then(function (res) {
                        hyMui.loaderHide();
                        var orderInfo = {
                            lhjcInfo: $scope.lhjcInfo,
                            xzsRList: $scope.xzsRList,
                            ccsRList: $scope.ccsRList,
                            xzsList: $scope.xzsList,
                            ccsList: $scope.ccsList
                        };
                        PassOrderService.savePassOrder(orderInfo, order); // 本地緩存传递工单数据
                        // 刪除此工单入参本地数据（目的为了初始化查询离线数据）
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        hyMui.alert('保存成功');
                    }, function () {
                        saveLhjcOffline(null);
                        hyMui.loaderHide();
                        hyMui.alert('圖片上傳中斷');
                    });
                    // hyMui.alert('保存成功');
                } else {
                    hyMui.loaderHide();
                    var message = data.rsltinfo && data.rsltinfo.indexOf('Save failure') < 0 ? "保存失敗," + data.rsltinfo : "保存失敗";
                    hyMui.alert(message);
                }
            }, function () {
                saveLhjcOffline(param);
                hyMui.loaderHide();
            });
        };

        function saveLhjcOffline(param) {
            var orderInfo = {
                lhjcInfo: $scope.lhjcInfo || {},
                xzsRList: $scope.xzsRList || [],
                ccsRList: $scope.ccsRList || [],
                xzsList: $scope.xzsList || [],
                ccsList: $scope.ccsList || []
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(orderInfo, order, param, photoKey);
        }

        function saveLock() {
            // 处理封印List
            var lockInfoList = [];
            // 添加新增锁列表
            for (var i = 0; i < $scope.xzsList.length; i++) {
                // 筛选未保存过的信息
                if (!$scope.xzsList[i].saveBz) {
                    lockInfoList.push(fyParam($scope.xzsList[i], '10', '1'));
                }
            }
            // 添加拆除锁列表
            for (var j = 0; j < $scope.ccsList.length; j++) {
                // 筛选未保存过的信息
                if (!$scope.ccsList[j].saveBz) {
                    lockInfoList.push(fyParam($scope.ccsList[j], '15', '1'));
                }
            }
            // 添加保存过的，又删除的列表
            for (var k = 0; k < saveFyList.length; k++) {
                // 筛选卫保存过的信息
                if (saveFyList[k].changeflag === '2') {
                    lockInfoList.push(fyParam(saveFyList[k], '10', '0'));
                } else if (saveFyList[k].changeflag === '4') {
                    lockInfoList.push(fyParam(saveFyList[k], '15', '0'));
                }
            }
            return lockInfoList;
        }

        /**
         * 构建锁的入参信息
         * @param obj
         * @param sealirflgcd
         * @param oprtflag
         * @returns
         */
        function fyParam(obj, sealirflgcd, oprtflag) {
            var time = $filter('date')(new Date(), 'yyyy-MM-DD HH:mm:ss');
            return {
                "chghsttyp": sealirflgcd,// 与sealirflgcd先保持一致
                "datauniqid": "",// 数据唯一标识
                "instldsealid": "",
                "sealassemeteequiuniqid": "",
                "sealmeteequiuniqid": "",
                "metepntno": $scope.lhjcInfo.metepntno, //计量点编号     无
                "sealirflgcd": sealirflgcd,//装拆变更标志
                "oprtflag": oprtflag,// 传“0”代表取消，传“1”代表新增
                "oprtr": $appConfig.userInfo.RYBS,//操作员ID       无  可取当前登录人的标识
                "seal": obj.seal,//加封人
                "sealasseno": $filter('lengthenNumber')(18, obj.sealasseno),//加封設備資產編號
                "sealequicate": obj.sealequicate,//加封設備類別
                "sealloc": obj.sealloc,//加封位置
                "sealno": $filter('lengthenNumber')(18, obj.sealno),//封印资产编号
                "sealtm": obj.sealtm || time,//加封時間
                "sealuse": "",
                "sealcolo": "",
                "wkordrno": task.wkordrno//工作单编号
            };
        }

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
                position = {jd: $scope.lhjcInfo.long1, wd: $scope.lhjcInfo.lati1}
            } else {
                position = {
                    jd: order.lon,
                    wd: order.lati,
                    supppntno: $scope.lhjcInfo.supppntno,
                    lowvoltequityp: $scope.lhjcInfo.lowvoltequityp
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
         * 扫一扫鎖編號
         */
        $scope.scanLock = function (item) {
            NativeService.scan().then(function (data) {
                item.sealno = data;
            });
        };
        /**
         * 扫一扫資產編號
         */
        $scope.scanZcbh = function (item) {
            NativeService.scan().then(function (data) {
                item.sealasseno = data;
            });
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
        var photoKey = "lhjc" + task.wkordrno;

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
                GZDBH: $scope.lhjcInfo.wkordrno,  //计划标识
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

        function initData() {
            $scope.jcjgDrop = [{
                DMBMMC: "完成",
                DMBM: "01"
            }, {
                DMBMMC: "未完成",
                DMBM: "00"
            }];
            $scope.xcrwlxDrop = [{
                DMBMMC: "一般性檢查",
                DMBM: "1"
            }, {
                DMBMMC: "現場檢查",
                DMBM: "2"
            }, {
                DMBMMC: "現場檢驗",
                DMBM: "3"
            }, {
                DMBMMC: "裝拆",
                DMBM: "4"
            }];
            $scope.clfsDrop = [{
                DMBMMC: "室內檢定",
                DMBM: "1"
            }, {
                DMBMMC: "無需室內檢定",
                DMBM: "2"
            }];
            // 加封對象
            systemDropList.getDropInfoList('SEALEQUICATECD').then(function (list) {
                $scope.jfsbDrop = list || [];
            });
        }

    }]);