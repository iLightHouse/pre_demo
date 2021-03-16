/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/17
 * 裝拆工單办理
 */
app.controller("cemzcsblCtrl", ['$scope', 'NativeService', '$http', '$appConfig', 'TaskService', 'systemDropList', '$filter', 'zcgdblsService', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineParamService', 'OfflineOrderService', 'OrderMapService',
    function ($scope, NativeService, $http, $appConfig, TaskService, systemDropList, $filter, zcgdblsService, $rootScope, PassOrderService, OrderCommonService, OfflineParamService, OfflineOrderService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        $scope.task = task;
        var orders = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var fromPage = mainNavi.getCurrentPage().options.fromPage || false;// lsjd -> 从临时检定、故障处理、批量录入跳转过来
        var network = mainNavi.getCurrentPage().options.network;// 批量处理 -> local 为获取本地数据的工单
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        var zcxxInfo = {};// 接口请求的装拆录入信息对象
        $scope.fromPage = fromPage;// 控制传递按钮
        $scope.flag = false;//默认显示中
        $scope.orderType = orders.orderType;
        $scope.languageSrc = 'img/cem/db/chines.png';
        $scope.SortType = 0;
        $scope.zcInfo = {};// 基本信息
        $scope.xzsList = [];// 新增鎖
        $scope.ccsList = [];// 拆除鎖
        $scope.xzsRList = [];// 新增鎖    查询接口返回原有数据
        $scope.ccsRList = [];// 拆除鎖    查询接口返回原有数据
        var saveFyList = [];// 删除锁的数组

        function init() {
            getDropList();// 初始化下拉值
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                // 装拆信息录入（传递）
                PassOrderService.getPassOrder(orders.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.zcInfo = orderInfo.zcInfo || {};
                        $scope.xzsRList = orderInfo.xzsRList || [];
                        $scope.ccsRList = orderInfo.ccsRList || [];
                        $scope.xzsList = orderInfo.xzsList || [];
                        $scope.ccsList = orderInfo.ccsList || [];
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 装拆信息录入：
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(orders.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getOfflineInfo('local');
                    } else {
                        var wkor = {
                            "wkordrno": task.wkordrno,
                            "inFlag": 'ZCS'
                        };
                        hyMui.loaderShow();
                        zcgdblsService.queryZcgdblOrderInfo(wkor).then(function (data) {
                            hyMui.loaderHide();
                            commonDeal(data);
                        }, function () {
                            // 分请求超时展示本地数据 和 请求超时无本地数据，提示重新请求
                            getOfflineInfo('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        /**
         * 获取离线缓存界面数据
         */
        function getOfflineInfo(state) {
            OfflineOrderService.getOfflineOrder(orders.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    // 保存过的初始化，直接复制$scope对象
                    $scope.zcInfo = orderInfo.zcInfo || {};
                    $scope.xzsRList = orderInfo.xzsRList || [];
                    $scope.ccsRList = orderInfo.ccsRList || [];
                    $scope.xzsList = orderInfo.xzsList || [];
                    $scope.ccsList = orderInfo.ccsList || [];
                    translateDate();
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        function translateDate() {
            // 翻译计费组别
            systemDropList.getDropLable('PRCTYPCD', $scope.zcInfo.prctyp).then(function (label) {
                $scope.zcInfo.prctypMc = label || $scope.zcInfo.prctyp;
            });
            for (var i = 0; i < $scope.xzsRList.length; i++) {
                !function (i) {
                    // 翻译加封位置
                    systemDropList.getDropLable('SEALLOCCD', $scope.xzsRList[i].sealloc).then(function (label) {
                        $scope.xzsRList[i].seallocMc = label || $scope.xzsRList[i].sealloc;
                    });
                    // 翻译加封對象
                    systemDropList.getDropLable('SEALEQUICATECD', $scope.xzsRList[i].sealequicate).then(function (label) {
                        $scope.xzsRList[i].sealequicateMc = label || $scope.xzsRList[i].sealequicate;
                    });
                }(i);
            }
        }

        function commonDeal(data) {
            zcxxInfo = data;
            zcxxInfo.infoVo.meterno = $filter('shortenNumber')(zcxxInfo.infoVo.meterno);// 去零
            zcxxInfo.infoVo.contractno = $filter('shortenNumber')(zcxxInfo.infoVo.contractno);// 去零
            $scope.zcInfo = zcxxInfo.infoVo;// 基本信息
            systemDropList.getDropLable('GISTYPECD', $scope.zcInfo.lowvoltequityp).then(function (label) {
                label = label || '';
                var supppntno = $scope.zcInfo.supppntno || '';
                $scope.zcInfo.supppntno = label + supppntno;
            });
            // 翻译计费组别
            systemDropList.getDropLable('PRCTYPCD', $scope.zcInfo.prctyp).then(function (label) {
                $scope.zcInfo.prctypMc = label || $scope.zcInfo.prctyp;
            });
            zhLockInfo(zcxxInfo.sealList);// 锁信息
        }

        /**
         * 组合锁信息
         * @param sysList
         */
        function zhLockInfo(sysList) {
            for (var i = 0; i < sysList.length; i++) {
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
                if ('10' === sysList[i].chgflg) { //目前按照10 新装  15 拆除的逻辑
                    $scope.xzsRList.push(sysList[i]);
                } else if ('15' === sysList[i].chgflg) {//拆除
                    $scope.ccsRList.push(sysList[i]);
                }
            }
        }

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
        /**
         * 保存信息
         */
        $scope.saveAll = function () {
            var param = {};
            var nowTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');// 当前时间
            // 存在重複的鎖編號，請重新錄入
            var lockAry = $scope.xzsList.concat($scope.xzsRList, $scope.ccsList, $scope.ccsRList);
            var nlockAry = [];
            for (var a = 0; a < lockAry.length; a++) {
                var flag = false;
                for (var b = 0; b < nlockAry.length; b++) {
                    if (lockAry[a].sealno === nlockAry[b].sealno) {
                        flag = true;
                    }
                }
                if(!flag){
                    nlockAry.push(lockAry[a]);
                }
            }
            if(nlockAry.length !== lockAry.length){
                hyMui.alert('存在重複的鎖編號，請重新錄入');
                return;
            }
            // 处理封印List
            var lockInfoList = [];
            // 添加新增锁列表
            for (var i = 0; i < $scope.xzsList.length; i++) {
                // 筛选卫保存过的信息
                if (!$scope.xzsList[i].saveBz) {
                    lockInfoList.push(fyParam($scope.xzsList[i], '10', '1'));
                }
            }
            // 添加拆除锁列表
            for (var i = 0; i < $scope.ccsList.length; i++) {
                // 筛选卫保存过的信息
                if (!$scope.ccsList[i].saveBz) {
                    lockInfoList.push(fyParam($scope.ccsList[i], '15', '1'));
                }
            }
            // 添加保存过的，又删除的列表
            for (var i = 0; i < saveFyList.length; i++) {
                // 筛选卫保存过的信息
                if (saveFyList[i].changeflag === '2') {
                    lockInfoList.push(fyParam(saveFyList[i], '10', '0'));
                } else if (saveFyList[i].changeflag === '4') {
                    lockInfoList.push(fyParam(saveFyList[i], '15', '0'));
                }
            }
            for (var i = 0; i < lockInfoList.length; i++) {
                if (!lockInfoList[i].sealno) {
                    hyMui.alert('請錄入鎖編號');
                    return;
                }
                if (!lockInfoList[i].metepntno) {
                    lockInfoList[i].metepntno = $scope.zcInfo.metepntno;
                }
            }
            // 构造入参
            param.svirsealrecinfoList = lockInfoList;// 封印
            // 离线缓存工单信息和入参
            if (!navigator.onLine) {
                saveOfflineInfo(param);
                return;
            }
            hyMui.loaderShow();
            zcgdblsService.saveZcgdblOrderInfo(param).then(function (data) {
                // hyMui.loaderHide();
                if (data.rslt === '0') {
                    // 处理锁数组相关数据
                    $scope.xzsList.forEach(function (item) {
                        item.saveBz = true;// 标记是否保存过，对于保存过的不再传递后台
                    });
                    $scope.ccsList.forEach(function (item) {
                        item.saveBz = true;// 标记是否保存过，对于保存过的不再传递后台
                    });
                    saveFyList.length = 0;// 保存成功，清除此數組
                    saveFlag = true;
                    orders.orderType = '1';// 工单状态，1.已保存 2.已传递
                    orders.offLineState = false;// 非离线工单
                    orders.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $rootScope.$broadcast("CHANGE_SAVE_ORDER", orders);
                    //上传照片
                    TaskService.uploadYjfkPicNew(photoKey).then(function (res) {
                        hyMui.loaderHide();
                        var pageOrderInfo = {
                            zcInfo: $scope.zcInfo,
                            xzsRList: $scope.xzsRList,
                            ccsRList: $scope.ccsRList,
                            xzsList: $scope.xzsList,
                            ccsList: $scope.ccsList,
                            premno: orders.premno
                        };
                        PassOrderService.savePassOrder(pageOrderInfo, orders); // 本地緩存传递工单数据
                        // 刪除此工单入参本地数据
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        hyMui.alert('保存成功');
                    }, function () {
                        saveOfflineInfo(null);
                        hyMui.loaderHide();
                        hyMui.alert('圖片上傳中斷');
                    });
                } else {
                    hyMui.loaderHide();
                    var message = data.rsltinfo && data.rsltinfo.indexOf('Save failure') < 0 ? "保存失敗," + data.rsltinfo : "保存失敗";
                    hyMui.alert(message);
                }
            }, function () {
                // 保存 param 与 orderInfo
                saveOfflineInfo(param);
                hyMui.loaderHide();
            });
        };

        /**
         * 离线缓存工单信息和入参
         * @param param 入参数据
         */
        function saveOfflineInfo(param) {
            var offlineOrderInfo = {
                zcInfo: $scope.zcInfo,
                xzsRList: $scope.xzsRList,
                ccsRList: $scope.ccsRList,
                xzsList: $scope.xzsList,
                ccsList: $scope.ccsList,
                premno: orders.premno
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(offlineOrderInfo, orders, param, photoKey);
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
                "metepntno": obj.metepntno ? obj.metepntno : "", //计量点编号     无
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
            sendCommon();
        };

        function sendCommon() {
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
                        orders.orderType = '2';// 工单状态，1.已保存 2.已传递
                        orders.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_PASS_ORDER", orders);
                        mainNavi.popPage();
                    });
                } else {
                    hyMui.alert("傳遞失敗");
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 初始化下拉值
         */
        function getDropList() {
            // 加封對象
            systemDropList.getDropInfoList('SEALEQUICATECD').then(function (list) {
                $scope.jfsbDrop = list || [];
            });
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
            var position = null;
            if (flag === 'equipment') {
                position = {jd: $scope.zcInfo.long1, wd: $scope.zcInfo.lati1}
            } else {
                position = {
                    jd: orders.lon,
                    wd: orders.lati,
                    supppntno: $scope.zcInfo.supppntno,
                    lowvoltequityp: $scope.zcInfo.lowvoltequityp
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
         * Tab页切换
         * @param type
         */
        $scope.selectSortType = function (type) {
            $scope.SortType = type;
        };

        /**
         * Tab页切换樣式控制
         * @param type
         * @returns {boolean}
         */
        $scope.integral = function (type) {
            return $scope.SortType === type;
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
        var photoKey = "zcb" + task.wkordrno;

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
                GZDBH: $scope.zcInfo.wkordrno,  //计划标识
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


    }]);