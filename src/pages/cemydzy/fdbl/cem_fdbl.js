/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/17
 * 復電工單辦理
 */
app.controller("cemfdblCtrl", ['$scope', '$http', 'NativeService', 'dxxxService', 'PhotoService', '$appConfig', 'TaskService', 'fdblService', 'systemDropList', '$filter', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, $http, NativeService, dxxxService, PhotoService, $appConfig, TaskService, fdblService, systemDropList, $filter, $rootScope, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        // var rybs = $appConfig.userInfo.RYBS;
        // var task = mainNavi.getCurrentPage().options.task || {};
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        $scope.orderType = order.orderType;
        $scope.SortType = 0;
        $scope.jbxx = {};// 基本信息
        // $scope.jcxx = {};// 檢查信息
        $scope.tdjgDrop = [];// 停电结果下拉
        $scope.flag = false;// 默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; // 默認中文圖標顯示
        $scope.xzsList = [];// 新增鎖
        $scope.ccsList = [];// 拆除鎖
        $scope.xzsRList = [];// 新增鎖    查询接口返回原有数据
        $scope.ccsRList = [];// 拆除鎖    查询接口返回原有数据
        var saveFyList = [];// 删除锁的数组
        var localImgData = [];// 离线工单图片fileId数组

        function init() {
            initXl(); // 初始化下拉翻译
            initData();// 初始化工单详情基本数据
        }

        init();

        /**
         * 调用服务查询工单基本信息
         */
        var lstreaddate = '';//上次抄表读数
        function initData() {
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.jbxx = orderInfo.jbxx || {};
                        $scope.xzsRList = orderInfo.xzsRList || [];
                        $scope.ccsRList = orderInfo.ccsRList || [];
                        $scope.xzsList = orderInfo.xzsList || [];
                        $scope.ccsList = orderInfo.ccsList || [];
                        localImgData = orderInfo.localImgData || [];
                        //上次停電任務標識，用於查詢上次停電圖片
                        if ($scope.jbxx.lsttdbs) {
                            // 下载图片
                            for (var i = 0; i < localImgData.length; i++) {
                                getImgBase64(i, localImgData[i]);
                            }
                        }
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getFdblOfflineOrder('local');
                    } else {
                        var param = {
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 100
                            },
                            "rcnntordrno": task.wkordrno
                        };
                        hyMui.loaderShow();
                        fdblService.queryFdblGzdDetails(param).then(function (data) {
                            hyMui.loaderHide();
                            initFdResult(data);
                        }, function () {
                            getFdblOfflineOrder('offline');
                            hyMui.loaderHide();
                        })
                    }
                });
            }
        }

        function getFdblOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    if (orderInfo.flag === 'init') {
                        // 未点击过保存的初始化
                        initFdResult(orderInfo);
                    } else {
                        // 保存过的初始化，直接复制$scope对象
                        $scope.jbxx = orderInfo.jbxx || {};
                        $scope.xzsRList = orderInfo.xzsRList || [];
                        $scope.ccsRList = orderInfo.ccsRList || [];
                        $scope.xzsList = orderInfo.xzsList || [];
                        $scope.ccsList = orderInfo.ccsList || [];
                        localImgData = orderInfo.localImgData || [];
                        //上次停電任務標識，用於查詢上次停電圖片
                        if ($scope.jbxx.lsttdbs) {
                            // 下载图片
                            for (var i = 0; i < localImgData.length; i++) {
                                getImgBase64(i, localImgData[i]);
                            }
                        }
                    }
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        function initFdResult(data) {
            if (data.infoVo) {
                data.infoVo.asseno = $filter('shortenNumber')(data.infoVo.asseno);// 去零
                data.infoVo.mtrasseno = $filter('shortenNumber')(data.infoVo.mtrasseno);// 去零
                data.infoVo.cntracctno = $filter('shortenNumber')(data.infoVo.cntracctno);// 去零
                $scope.jbxx = dealData(data.infoVo); //基本信息
                // systemCurread = data.infoVo.currread;
                // 存在电表读数，给电表号赋值
                if($scope.jbxx.currread === 0){
                    $scope.jbxx.currread = '0';
                }
                if ($scope.jbxx.currread) {
                    $scope.jbxx.asseno = $scope.jbxx.mtrasseno;// 结果信息和基本信息中的电表号
                }
                //获取上次读数
                if ($scope.jbxx.lstmrotime && !$scope.jbxx.lsttime) {
                    lstreaddate = $scope.jbxx.lstmroread;
                } else if (!$scope.jbxx.lstmrotime && $scope.jbxx.lsttime) {
                    lstreaddate = $scope.jbxx.lstread;
                } else if ($scope.jbxx.lstmrotime && $scope.jbxx.lsttime) {//取这两个时间距离当前时间最近的读数
                    if ($scope.jbxx.lstmrotime > $scope.jbxx.lsttime) {
                        lstreaddate = $scope.jbxx.lstmroread;
                    } else {
                        lstreaddate = $scope.jbxx.lstread;
                    }
                }
                // $scope.jbxx.rmdminute = '2020-05-22 19:25:00.0';
                if ($scope.jbxx.arresetttm) {
                    $scope.jbxx.rmdminuteTm = timeLeft($scope.jbxx.arresetttm);
                }
                // 复电类型翻译
                systemDropList.getDropLable('RCNNTORDRTYPCD', $scope.jbxx.rcnntordrtypcd).then(function (label) {
                    $scope.jbxx.rcnntordrtypcdMc = label || $scope.jbxx.rcnntordrtypcd;
                });
                systemDropList.getDropLable('GISTYPECD', $scope.jbxx.supppnttyp).then(function (label) {
                    label = label || '';
                    var supppntno = $scope.jbxx.supppntno || '';
                    $scope.jbxx.supppntno = label + supppntno;
                });
                //上次停電工单以及上次停电任务创建时间，用於查詢上次停電圖片
                if ($scope.jbxx.lsttdbs) {
                    if (data.flag === 'init') {
                        if (data.localImgData) {
                            // 下载图片
                            for (var i = 0; i < data.localImgData.length; i++) {
                                getImgBase64(i, data.localImgData[i]);
                            }
                        }
                    } else {
                        var tskcretm = $scope.jbxx.lstcretm ? $scope.jbxx.lstcretm.substring(0, 19) : '';
                        var timeStr = tskcretm.replace(/[^0-9]/ig, "");
                        var picGzdbh = $scope.jbxx.lsttdbs + '_' + timeStr;
                        queryTdImg(picGzdbh);
                    }
                }
            }
            if (data.infoList && data.infoList.length > 0) {
                // 处理装拆设备信息   根据装拆标志区分为新装和拆除
                for (var i = 0; i < data.infoList.length; i++) {
                    // var tem = dealSbData(data.infoList[i]);
                    /*switch (data.infoList[i].sealequicate) {
                        case '01':
                            data.infoList[i].sealassemeteequiuniqidMc = '電能表';
                            break;
                        case '02':
                            data.infoList[i].sealassemeteequiuniqidMc = '互感器';
                            break;
                        case '03':
                            data.infoList[i].sealassemeteequiuniqidMc = '計量點';
                            break;
                    }*/
                    data.infoList[i].sealno = $filter('shortenNumber')(data.infoList[i].sealno);// 去零
                    if (data.infoList[i].sealasseno) {
                        data.infoList[i].sealasseno = $filter('shortenNumber')(data.infoList[i].sealasseno);// 去零
                    }
                    (function (i) {
                        // 翻译加封位置
                        systemDropList.getDropLable('SEALLOCCD', data.infoList[i].sealloc).then(function (label) {
                            data.infoList[i].seallocMc = label || data.infoList[i].sealloc;
                        });
                        // 翻译加封對象
                        systemDropList.getDropLable('SEALEQUICATECD', data.infoList[i].sealequicate).then(function (label) {
                            data.infoList[i].sealassemeteequiuniqidMc = label || data.infoList[i].sealequicate;
                        });
                    })(i);
                    if ('10' === data.infoList[i].chghsttyp) { //目前按照10 新装  15 拆除的逻辑
                        $scope.xzsRList.push(data.infoList[i]);
                    } else if ('15' === data.infoList[i].chghsttyp) { //拆除
                        $scope.ccsRList.push(data.infoList[i]);
                    }
                }
            }
        }

        $scope.menus = [];

        /**
         * 查詢上次停電相關圖片
         */
        function queryTdImg(sctdbs) {
            var param = {
                "paramMap": {
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 1,
                        "rowOfPage": 100
                    },
                    "module": "workOrder",
                    "businessNo": sctdbs
                }
            };
            hyMui.loaderShow();
            dxxxService.queryInfoFileId(param).then(function (data) {
                hyMui.loaderHide();
                if (data.length > 0) {
                    localImgData = data;// 缓存到离线数据中
                    // 下载图片
                    for (var i = 0; i < data.length; i++) {
                        getImgBase64(i, data[i]);
                    }
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 请求图片：先从本地查找，未找到则请求接口并保存到本地
         * @param index
         * @param id
         */
        function getImgBase64(index, id) {
            if (!id) return;
            PhotoService.getPhoto(id).then(function (value) {
                if (value.length > 0) {
                    $scope.menus[index] = value[0];//ISUPLOAD
                } else {
                    var param = {
                        "paramMap": {
                            "fileId": id
                        }
                    };
                    hyMui.loaderShow();
                    TaskService.queryImgBase64(param).then(function (data) {
                        hyMui.loaderHide();
                        if (!data.osString) return;
                        $scope.menus[index] = {src: data.osString};
                        var obj = {
                            fileId: id,
                            base: data.osString
                        };
                        PhotoService.savePhoto(obj)
                    }, function () {
                        hyMui.loaderHide();
                    });
                }
            });
        }

        /**
         * 创建图片面板
         */
        var searchDialog = null;
        var initDialog = function () {
            ons.ready(function () {
                ons.createDialog('pages/common/gb/viewImage.html', {parentScope: $scope}).then(function (dialog) {
                    searchDialog = dialog;
                });
            });
        };

        initDialog();

        $scope.showImg = function (img) {
            $scope.src = img;
            searchDialog.show();
        };

        /**
         * 保存信息并校驗
         */
        $scope.saveTdxx = function () {
            if (!$scope.jbxx.rcnntrsltcd) {
                hyMui.alert('請填寫復電結果');
                return
            }
            if ($scope.jbxx.rcnntrsltcd === '02' && !$scope.jbxx.rcnntfailrsncd) {
                hyMui.alert('復電失敗，請填寫復電失敗原因');
                return
            }
            if ($scope.jbxx.rcnntrsltcd === '01' && ($scope.jbxx.disconmethcd === '81' || $scope.jbxx.disconmethcd === '83') && (!$scope.jbxx.asseno || !$scope.jbxx.currread)) {
                hyMui.alert('復電成功，請填寫電錶號和電錶讀數');
                return
            }
            if ($scope.jbxx.asseno && $scope.jbxx.mtrasseno && $scope.jbxx.asseno !== $scope.jbxx.mtrasseno) {
                hyMui.alert('電錶號碼不一致，請核對');
                return
            }
            if ($scope.jbxx.currread && !$scope.jbxx.asseno) {
                hyMui.alert('請錄入電錶號');
                return
            }
            //校驗錄入的讀數是否等於上次讀數，如果不是，彈出提示，“上次讀數為：XXX，是否確認本次讀數？”
            var sameFlag = true;
            if (lstreaddate && $scope.jbxx.currread) {
                var lstreadstr = lstreaddate.toString();
                if (lstreadstr.indexOf(".") > -1) {
                    lstreadstr = lstreadstr.substring(0, lstreadstr.indexOf(".") + 1);//读数格式是123.00000,截取123
                }
                var curreadstr = $scope.jbxx.currread.toString();
                if (curreadstr.indexOf(".") > -1) {
                    curreadstr = curreadstr.substring(0, curreadstr.indexOf(".") + 1);
                }
                if (lstreadstr != curreadstr) {
                    sameFlag = false;
                }
            }
            if (sameFlag) {
                save();
            } else {
                hyMui.confirm({
                    title: '确认',
                    message: '上次讀數為：' + lstreadstr + '，是否確認本次讀數？',
                    buttonLabels: ['否', '是'],
                    callback: function (i) {
                        if (i === 1) {
                            // 执行保存
                            save();
                        }
                    }
                });
            }
        };

        /**
         * 调用保存接口
         * @param type
         */
        function save() {
            var param = dealSaveInParam();
            if (param == false) {
                return;
            }
            if (!navigator.onLine) {
                saveFdblOfflie(param);
                return;
            }
            // 执行保存
            hyMui.loaderShow();
            fdblService.saveFdblGzdDetails(param).then(function (data) {
                if (data.rslt === '0') {
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
                            jbxx: $scope.jbxx,
                            xzsRList: $scope.xzsRList,
                            ccsRList: $scope.ccsRList,
                            xzsList: $scope.xzsList,
                            ccsList: $scope.ccsList,
                            localImgData: localImgData // 上次停电图片
                        };
                        PassOrderService.savePassOrder(orderInfo, order); // 本地緩存传递工单数据
                        // 刪除此工单入参本地数据
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        hyMui.alert('保存成功，請傳遞工單！');
                    }, function () {
                        saveFdblOfflie(null);
                        hyMui.loaderHide();
                        hyMui.alert('圖片上傳中斷');
                    });
                    // hyMui.alert('保存成功');
                } else {
                    hyMui.loaderHide();
                    var mess = "保存失敗";
                    if (data && data.rsltinfo) {
                        mess += "," + data.rsltinfo;
                    }
                    hyMui.alert(mess);
                }
            }, function () {
                saveFdblOfflie(param);
                hyMui.loaderHide();
            })
        }

        function saveFdblOfflie(param) {
            var orderInfo = {
                jbxx: $scope.jbxx || {},
                xzsRList: $scope.xzsRList || [],
                ccsRList: $scope.ccsRList || [],
                xzsList: $scope.xzsList || [],
                ccsList: $scope.ccsList || [],
                localImgData: localImgData // 上次停电图片
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(orderInfo, order, param, photoKey);
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
         * 如果保存成功，返回时需要提示保存成功
         */
        $scope.$on('$destroy', function () {
            if (order.orderType === '1') {
                hyMui.alert('請傳遞' + task.wkordrno + '工單！');
            }
        });

        /**
         * 读数校验
         */
        $scope.testRead = function () {
            var reg = /^[0-9]*([.][0-9]+)?$/;
            if (!reg.test($scope.jbxx.currread)) {
                hyMui.alert('請輸入正確讀數');
            }
        };

        /**
         * Tab页切换
         * @param type
         */
        $scope.selectSortType = function (type) {
            $scope.SortType = type;// 赋值切换项
        };

        /**
         * Tab页切换樣式控制
         * @param type
         * @returns {boolean}
         */
        $scope.integral = function (type) {
            return $scope.SortType === type;
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
                sealirflgcd: "",// 变更标志
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
        /*$scope.$on('CEMJCXM_XZSHFD', function (ev, item) {
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
                flag: flag
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
        /*$scope.$on('CEMJCXM_CCSXXGD', function (ev, item) {
            var content = '';
            // 传递过来的为数组
            for (var i = 0; i < item.length; i++) {
                if ($scope.ccsList.length > 0) {
                    var res = $scope.ccsList.some(function (ccs) {
                        if (ccs.sealno === item[i].sealno) {
                            return true
                        } else {
                            return false
                        }
                    });
                    // 如果不存在锁编号相同的情况则添加，相同则继续循环
                    if (!res) {
                        translationXl(item[i]);// 翻译下拉
                        // 翻译加封位置
                        (function (i) {
                            systemDropList.getDropLable('SEALLOCCD', item[i].sealloc).then(function (label) {
                                item[i].jfwzmc = label || item[i].sealloc;
                            });
                        })(i);
                        $scope.ccsList.unshift(item[i]);
                    } else {
                        content += item[i].sealno + ',';
                        continue;
                    }
                } else {
                    translationXl(item[i]);// 翻译下拉
                    // 翻译加封位置
                    (function (i) {
                        systemDropList.getDropLable('SEALLOCCD', item[i].sealloc).then(function (label) {
                            item[i].jfwzmc = label || item[i].sealloc;
                        });
                    })(i);
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
                    lowvoltequityp: $scope.jbxx.supppnttyp
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
         * 扫一扫电表号码
         */
        $scope.scanMeter = function () {
            NativeService.scan().then(function (data) {
                $scope.jbxx.asseno = data;
            });
        };

        /**
         * 初始化下拉列表
         */
        function initXl() {
            //构造下拉
            systemDropList.getDropInfoList('RCNNTRSLTCD').then(function (list) {
                if (list) {
                    $scope.tdjgDrop = list;
                }
            });
            // 复电失败原因
            systemDropList.getDropInfoList('RCNNTFAILRSNCD').then(function (list) {
                $scope.sbyyDrop = list || [];
            });
            // 加封對象
            systemDropList.getDropInfoList('SEALEQUICATECD').then(function (list) {
                $scope.jfsbDrop = list || [];
            });
        }

        /**
         * 處理基本數據
         * 下拉翻譯
         */
        function dealData(data) {
            //停电方式下拉代码分类
            systemDropList.getDropLable('DISCONMETHCD', data.disconmethcd).then(function (label) {
                data.disconmethcdMc = label || data.disconmethcd;
            });
            //申请功率
            systemDropList.getDropLable('LOADCODECD', data.sqsubsdema).then(function (label) {
                data.sqsubsdemaMc = label || data.sqsubsdema;
            });
            //断路器类型
            systemDropList.getDropLable('MCBTYPCD', data.mcbtyp).then(function (label) {
                data.mcbtypMc = label || data.mcbtyp;
            });
            //断路器安装位置
            systemDropList.getDropLable('MCBINSTLOCCD', data.mcbinstloc).then(function (label) {
                data.mcbinstlocMc = label || data.mcbinstloc;
            });
            //断路器电流
            systemDropList.getDropLable('BAUDRTCD', data.mcbcur).then(function (label) {
                data.mcbcurMc = label || data.mcbcur;
            });
            return data;
        }

        /**
         * 處理装拆设备数据
         * 下拉翻譯
         */
        function dealSbData(data) {
            /*sealequicate 加封对象      sealloc  加封位置*/
            //加封对象名称
            switch (data.sealequicate) {
                case '1':
                    data.sealassemeteequiuniqidMc = '電能表';
                    break;
                case '2':
                    data.sealassemeteequiuniqidMc = '互感器';
                    break;
                case '3':
                    data.sealassemeteequiuniqidMc = '計量點';
                    break;
            }
            //加封位置
            systemDropList.getDropLable('SEALLOCCD', data.sealloc).then(function (label) {
                data.seallocMc = label || data.sealloc;
            });
            return data;
        }

        /**
         * 封装保存接口入参
         * inParam
         */
        function dealSaveInParam() {
            var timeNow = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var apprcnntrslvo = {
                "actlexecdt": $scope.jbxx.actlexecdt ? $scope.jbxx.actlexecdt : timeNow,//实际执行时间        基本信息actlexecdt
                "lattskid": $scope.jbxx.rcnnttskid,// 最新任务标识    无
                "operatorid": rybs,//操作员ID      无   可以直接获取当前登录人员的人员标识
                "rcnntempno": $scope.jbxx.rcnntempno,//复电人员             基本信息rcnntempno
                "rcnntfailrsncd": $scope.jbxx.rcnntfailrsncd,//复电失败原因代码     基本信息  rcnntfailrsncd    页面也可有改动
                "rcnntordrno": $scope.jbxx.rcnntordrno,//复电工单编号     基本信息rcnntordrno
                "rcnntrsltcd": $scope.jbxx.rcnntrsltcd,//复电结果代码     基本信息   rcnntrsltcd   页面也可有改动
                "rmk": $scope.jbxx.rmk,//现场作业备注    基本信息  rmk    页面也可有改动
                "uppers": rybs,//上传人    无   可拿当前登录人员标识
                "uptm": timeNow//上传时间     无     获取当前时间
            };
            //处理添加锁列表
            var rpinstldsealaddVOList = [];
            for (var i = 0; i < $scope.xzsList.length; i++) {
                // 筛选卫保存过的信息
                if (!$scope.xzsList[i].saveBz) {
                    rpinstldsealaddVOList.push(xzParam($scope.xzsList[i], '1'));
                }
            }
            //添加拆除锁列表
            for (var i = 0; i < $scope.ccsList.length; i++) {
                // 筛选卫保存过的信息
                if (!$scope.ccsList[i].saveBz) {
                    rpinstldsealaddVOList.push(cxParam($scope.ccsList[i], '3'));
                }
            }
            //添加保存过的，又删除的列表
            for (var i = 0; i < saveFyList.length; i++) {
                // 筛选卫保存过的信息
                if (saveFyList[i].changeflag === '4') {
                    rpinstldsealaddVOList.push(cxParam(saveFyList[i], '4'));
                } else if (saveFyList[i].changeflag === '2') {
                    rpinstldsealaddVOList.push(xzParam(saveFyList[i], '2'));
                }
            }
            for (var i = 0; i < rpinstldsealaddVOList.length; i++) {
                if (!rpinstldsealaddVOList[i].sealno) {
                    hyMui.alert("請錄入鎖編號");
                    return false;
                }
            }
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
            var param = {
                "appinstldsealaddVOList": rpinstldsealaddVOList,
                "apprcnntrslvo": apprcnntrslvo
            };
            if ($scope.jbxx.asseno) {
                param.appreadingentityvo = {
                    "asseno": $filter('lengthenNumber')(18, $scope.jbxx.asseno),//资产编号
                    "currread": $scope.jbxx.currread,//讀數
                    "metepntno": $scope.jbxx.metepntno,// 計量點編號
                    "mrrsncd": "18",//抄表原因编号
                    "mrtyp": "05"//抄表类型
                };
            } else {
                param.appreadingentityvo = null;
            }
            return param;
        }

        /**
         * 构建新增锁的入参信息
         * @param obj
         * @param flag
         * @returns
         */
        function xzParam(obj, flag) {
            return {
                "changeflag": flag, //装拆变更标志     默认装拆变更标志，1新装；2新装取消；3拆除；4拆除取消
                "metepntno": $scope.jbxx.metepntno, //计量点编号     无
                "operatorid": rybs,//操作员ID       无  可取当前登录人的标识
                "seal": obj.seal,//加封人
                "sealasseno": $filter('lengthenNumber')(18, obj.sealasseno),//加封設備資產編號
                "sealequicate": obj.sealequicate,//加封設備類別
                "sealloc": obj.sealloc,//加封位置
                "sealno": $filter('lengthenNumber')(18, obj.sealno),//封印资产编号
                "sealtm": obj.sealtm,//加封時間
                //"wkordrno": $scope.jbxx.rcnntordrno//工作单编号
                "wkordrno": task.wkordrno//工作单编号
            };
        }

        /**
         * 构建拆除锁的入参信息
         * @param obj
         * @param flag
         * @returns
         */
        function cxParam(obj, flag) {
            return {
                "changeflag": flag, //装拆变更标志     默认装拆变更标志，1新装；2新装取消；3拆除；4拆除取消
                "metepntno": $scope.jbxx.metepntno, //计量点编号     无
                "operatorid": rybs,//操作员ID       无  可取当前登录人的标识
                "seal": obj.seal,//加封人
                "sealasseno": $filter('lengthenNumber')(18, obj.sealasseno),//加封設備資產編號  sealasseno
                "sealequicate": obj.sealequicate,//加封設備類別
                "sealloc": obj.sealloc,//加封位置
                "sealno": $filter('lengthenNumber')(18, obj.sealno),//封印资产编号
                "sealtm": obj.sealtm,//加封時間
                "wkordrno": $scope.jbxx.rcnntordrno  //工作单编号
            };
        }

        /**
         * 停电成功，停電失敗原因清空
         * @param value
         */
        $scope.failChange = function (value) {
            if (value === '01') {
                $scope.jbxx.rcnntfailrsncd = '';
            }
        };

        /**
         * 复电剩余时间计算
         * @param appointmentTime
         * @returns {string}
         */
        function timeLeft(appointmentTime) {
            appointmentTime = appointmentTime.split('.')[0];
            var hh = '00';
            var mm = '00';
            var ss = '00';
            var preTime = new Date(appointmentTime).getTime();
            var nowTime = new Date().getTime();
            var fdTime = (nowTime - preTime) / 1000;//秒
            //  fdTime<0 则剩余复电时间取4小时;fdTime>240*6000，则剩余复电时间取0小时
            if (fdTime <= 0 || fdTime === 240 * 60) {
                hh = '04';
            } else if (fdTime < 240 * 60) {
                var remainderTime = Math.round(4 * 60 * 60 - fdTime);// 秒
                hh = Math.floor(remainderTime / 60 / 60).toString();// 小时
                mm = Math.floor((remainderTime - hh * 60 * 60) / 60).toString();// 分钟
                ss = Math.floor(remainderTime - hh * 60 * 60 - mm * 60).toString();// 秒
                hh = hh.length === 1 ? '0' + hh : hh;
                mm = mm.length === 1 ? '0' + mm : mm;
                ss = ss.length === 1 ? '0' + ss : ss;
            }
            return hh + ':' + mm + ':' + ss;
        }

        var remarksDialog = null;

        /**
         * 创建备注详情面板
         */
        var initDialogs = function () {
            ons.ready(function () {
                ons.createDialog('pages/common/remarks/showRemarks.html', {parentScope: $scope}).then(function (dialog) {
                    remarksDialog = dialog;
                });
            });
        };

        initDialogs();

        $scope.showRemark = function () {
            $scope.commonRemark = $scope.jbxx.rcnntrmk;
            remarksDialog.show();
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
        var photoKey = "fdbl" + task.wkordrno;

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
            var tskcretm = $scope.jbxx.tskcretm ? $scope.jbxx.tskcretm.substring(0, 19) : '';
            var timeStr = tskcretm.replace(/[^0-9]/ig, "");
            var picGzdbh = $scope.jbxx.rcnntordrno + '_' + timeStr;
            var task = {
                GZDBH: picGzdbh,  //计划标识
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
    }

]);