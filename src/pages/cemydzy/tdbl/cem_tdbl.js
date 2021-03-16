/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/16
 * 停電工單辦理
 */
app.controller("cemtdblCtrl", ['$scope', '$http', 'NativeService', '$appConfig', 'TaskService', 'tdblService', 'systemDropList', '$filter', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, $http, NativeService, $appConfig, TaskService, tdblService, systemDropList, $filter, $rootScope, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        // var task = mainNavi.getCurrentPage().options.task || {};
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        $scope.orderType = order.orderType;
        $scope.SortType = 0;
        $scope.jbxx = {};//基本信息
        $scope.flag = false;// 默认显示中
        $scope.tdjgDrop = [];// 停电结果下拉
        $scope.tdfsDrop = [];// 停电方式下拉
        $scope.languageSrc = 'img/cem/db/chines.png'; // 默認中文圖標顯示
        $scope.xzsList = [];// 新增鎖
        $scope.ccsList = [];// 拆除鎖
        $scope.xzsRList = [];// 新增鎖    查询接口返回原有数据
        $scope.ccsRList = [];// 拆除鎖    查询接口返回原有数据
        var saveFyList = [];// 删除锁的数组

        function init() {
            //獲取下拉列表
            initXl();
            //初始化工單數據
            initData();
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
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getTdblOfflineOrder('local');
                    } else {
                        var param = {
                            "vo": {
                                "disconordrno": task.wkordrno
                            }
                        };
                        hyMui.loaderShow();
                        tdblService.queryTdblGzdDetails(param).then(function (data) {
                            hyMui.loaderHide();
                            initResult(data);
                        }, function () {
                            getTdblOfflineOrder('offline');
                            hyMui.loaderHide();
                        })
                    }
                });
            }
        }

        function getTdblOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    if (orderInfo.flag === 'init') {
                        // 未点击过保存的初始化
                        initResult(orderInfo);
                    } else {
                        // 保存过的初始化，直接复制$scope对象
                        $scope.jbxx = orderInfo.jbxx || {};
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

        function initResult(data) {
            if (data.infoVo) {
                data.infoVo.asseno = $filter('shortenNumber')(data.infoVo.asseno);// 去零
                data.infoVo.mtrasseno = $filter('shortenNumber')(data.infoVo.mtrasseno);// 去零
                data.infoVo.cntracctno = $filter('shortenNumber')(data.infoVo.cntracctno);// 去零
                $scope.jbxx = dealData(data.infoVo); // 基本信息，翻译下拉
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
                // 复电类型翻译
                systemDropList.getDropLable('DISCONORDRTYPCD', $scope.jbxx.disconordrtypcd).then(function (label) {
                    $scope.jbxx.disconordrtypcdMc = label || $scope.jbxx.disconordrtypcd;
                });
                systemDropList.getDropLable('GISTYPECD', $scope.jbxx.supppnttyp).then(function (label) {
                    label = label || '';
                    var supppntno = $scope.jbxx.supppntno || '';
                    $scope.jbxx.supppntno = label + supppntno;
                });
                // 上次未成功停电翻译
                systemDropList.getDropLable('DISCONFAILRSNCD', $scope.jbxx.lstdisconfailrsncd).then(function (label) {
                    $scope.jbxx.lstdisconfailrsncd = label || $scope.jbxx.lstdisconfailrsncd;
                });
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
                    } else if ('15' === data.infoList[i].chghsttyp) {//拆除
                        $scope.ccsRList.push(data.infoList[i]);
                    }
                }
            }
        }

        /**
         * 保存信息并校驗
         */
        $scope.saveTdxx = function () {
            if (!$scope.jbxx.disconrsltcd) {
                hyMui.alert('請填寫停電結果');
                return
            }
            if ($scope.jbxx.disconrsltcd === '02' && !$scope.jbxx.disconfailrsncd) {
                hyMui.alert('停電失敗，請填寫停電失敗原因');
                return
            }
            if ($scope.jbxx.disconrsltcd === '01' && ($scope.jbxx.disconmethcd === '81' || $scope.jbxx.disconmethcd === '83') && (!$scope.jbxx.asseno || !$scope.jbxx.currread)) {
                hyMui.alert('請填寫電錶號和電錶讀數');
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
                saveTdblOffline(param);
                return;
            }
            hyMui.loaderShow();
            tdblService.saveTdblGzdDetails(param).then(function (data) {
                if (data.rslt === '0') {
                    $scope.xzsList.forEach(function (item) {
                        item.saveBz = true;// 标记是否保存过，对于保存过的不再传递后台
                    });
                    $scope.ccsList.forEach(function (item) {
                        item.saveBz = true;// 标记是否保存过，对于保存过的不再传递后台
                    });
                    saveFyList.length = 0;// 保存成功，清除此數組hn
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
                            ccsList: $scope.ccsList
                        };
                        PassOrderService.savePassOrder(orderInfo, order); // 本地緩存传递工单数据
                        // 刪除此工单入参本地数据（目的为了初始化查询离线数据）
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        hyMui.alert('保存成功，請傳遞工單！');
                    }, function () {
                        saveTdblOffline(null);
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
                saveTdblOffline(param);
                hyMui.loaderHide();
            });
        }

        function saveTdblOffline(param) {
            var orderInfo = {
                jbxx: $scope.jbxx || {},
                xzsRList: $scope.xzsRList || [],
                ccsRList: $scope.ccsRList || [],
                xzsList: $scope.xzsList || [],
                ccsList: $scope.ccsList || []
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(orderInfo, order, param, photoKey);
        }

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
         * 如果保存成功，返回时需要提示保存成功
         */
        $scope.$on('$destroy', function () {
            if (order.orderType === '1') {
                hyMui.alert('請傳遞' + task.wkordrno + '工單！');
            }
        });

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
        /*$scope.AddSh = function () {
            mainNavi.pushPage('pages/cemydzy/tdbl/cem_xzsh.html', {
                cancelIfRunning: true
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
        /*$scope.$on('CEMJCXM_XZSH', function (ev, item) {
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
        /*$scope.AddCcs = function () {
            mainNavi.pushPage('pages/cemydzy/tdbl/cem_ccsxx.html', {
                cancelIfRunning: true,
                cntracctno: $scope.jbxx.cntracctno
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
        /*$scope.$on('CEMJCXM_CCSXX', function (ev, item) {
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
            /*switch (item.sealloc) {
                case '01':
                    item.jfwzmc = '左耳封';
                    break;
                case '02':
                    item.jfwzmc = '右耳封';
                    break;
                case '03':
                    item.jfwzmc = '上耳封';
                    break;
                case '04':
                    item.jfwzmc = '下耳封';
                    break;
            }*/
        }

        /**
         * 初始化下拉列表
         */
        function initXl() {
            // 停電結果
            systemDropList.getDropInfoList('DISCONRSLTCD').then(function (list) {
                if (list) {
                    $scope.tdjgDrop = list;
                }
            });
            // 停电失败原因
            systemDropList.getDropInfoList('DISCONFAILRSNCD').then(function (list) {
                $scope.sbyyDrop = list || [];
            });
            // 停电方式
            systemDropList.getDropInfoList('DISCONMETHCD').then(function (list) {
                $scope.tdfsDrop = list || [];
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
            systemDropList.getDropLable('LOADCODECD', data.subsdema).then(function (label) {
                data.subsdemaMc = label || data.subsdema;
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
            var disconrslVO = {
                "actlexecdt": $scope.jbxx.actlexecdt ? $scope.jbxx.actlexecdt : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'), //实际执行时间
                // "actlexecdt": $scope.jbxx.actlexecdt, //上次執行日期
                "disconempno": $scope.jbxx.disconempno,//停電人員
                "disconfailrsncd": $scope.jbxx.disconfailrsncd,//停電失敗原因
                "disconmethcd": $scope.jbxx.disconmethcd,//停電方式
                "disconordrno": $scope.jbxx.disconordrno,//工作單編號
                "disconrsltcd": $scope.jbxx.disconrsltcd,//停電結果
                "lattskid": $scope.jbxx.discontskid,//當前任務標識    停電工單任務標識
                "operatorid": $appConfig.userInfo.RYBS,//操作人ID
                "rmk": $scope.jbxx.rmk,//現場作業備註
                "uppers": $appConfig.userInfo.RYBS,//上傳人
                "uptm": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')//上傳時間
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
                "rpinstldsealaddVOList": rpinstldsealaddVOList,
                "disconrslVO": disconrslVO
            };
            if ($scope.jbxx.asseno) {
                param.readingVO = {
                    "asseno": $filter('lengthenNumber')(18, $scope.jbxx.asseno),//資產編號   暫無
                    "compmultfact": 0,//
                    "currread": $scope.jbxx.currread,//讀數
                    "instmtrid": '',//
                    "metepntno": $scope.jbxx.metepntno,// 計量點編號
                    "mrrsncd": '13',//抄錶原因編號
                    "mrtyp": '05'//抄錶類型    停电：抄表原因MRRSNCD传'13'  复电：传'18'；MRTYP传'05'
                };
            } else {
                param.readingVO = null;
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
                "operatorid": $appConfig.userInfo.RYBS,//操作员ID       无  可取当前登录人的标识
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
                "operatorid": $appConfig.userInfo.RYBS,//操作员ID       无  可取当前登录人的标识
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
                $scope.jbxx.disconfailrsncd = '';
            }
        };

        /**
         * 传递
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
            $scope.commonRemark = $scope.jbxx.disconrmk;
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
        var photoKey = "tdbl" + task.wkordrno;

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
            var picGzdbh = $scope.jbxx.disconordrno + '_' + timeStr;
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
                message: '確認删除此照片？',
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