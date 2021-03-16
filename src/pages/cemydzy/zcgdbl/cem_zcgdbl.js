/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/17
 * 裝拆工單办理
 */
app.controller("cemzcgdblCtrl", ['$scope', 'NativeService', '$http', '$appConfig', 'TaskService', 'systemDropList', '$filter', 'zcgdblsService', '$rootScope', 'PassOrderService', 'ToolService', 'OrderCommonService', 'OfflineParamService', 'OfflineOrderService', 'azwzxxService', 'OrderMapService',
    function ($scope, NativeService, $http, $appConfig, TaskService, systemDropList, $filter, zcgdblsService, $rootScope, PassOrderService, ToolService, OrderCommonService, OfflineParamService, OfflineOrderService, azwzxxService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var orders = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var fromPage = mainNavi.getCurrentPage().options.fromPage || "";// lsjd -> 从临时检定、故障处理、批量录入跳转过来
        $scope.lsjdOrderType = mainNavi.getCurrentPage().options.lsjdOrderType || false;// lsjd -> 从临时检定、故障处理已传递点击过来
        var network = mainNavi.getCurrentPage().options.network;// 批量处理 -> local 为获取本地数据的工单
        var passData = mainNavi.getCurrentPage().options.data || {};// 批量装拆信息录入传递（离线保存）数据
        var offlineTaskList = mainNavi.getCurrentPage().options.offlineTaskList;// 批量装拆信息录入初始化任务列表（除去当前任务）
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        var zcxxInfo = {};// 接口请求的装拆录入信息对象
        var order = null;// 设备安装位置下标
        var sbFlag = null; //區分是互感器還是電能表
        $scope.fromPage = fromPage === 'lsjd' || fromPage === 'gzcl';// 控制传递按钮
        $scope.flag = false;//默认显示中
        $scope.orderType = orders.orderType;
        $scope.languageSrc = 'img/cem/db/chines.png';
        $scope.SortType = 0;
        $scope.zcInfo = {};// 基本信息
        $scope.dnbList = [];// 电能表信息
        $scope.dsList = [];// 电能表读数信息
        $scope.hgqList = [];// 互感器
        $scope.dlqList = [];// 断路器
        $scope.xzsList = [];// 新增鎖
        $scope.ccsList = [];// 拆除鎖
        $scope.xzsRList = [];// 新增鎖    查询接口返回原有数据
        $scope.ccsRList = [];// 拆除鎖    查询接口返回原有数据
        var saveFyList = [];// 删除锁的数组
        $scope.anwzData = [];// 离线安装位置
        $scope.gzjgDrop = [{
            DMBMMC: "通過",
            DMBM: "1"
        }, {
            DMBMMC: "不通過",
            DMBM: "2"
        }];
        /**
         * 查询电能表示数
         * @param itemObj
         */
        $scope.queryRead = function (itemObj) {
            if (!itemObj.asseno) {
                itemObj.irflg = '00';//若资产编号为空，则装拆标志为未装拆
                return;
            }
            //拆除，抄表，如果是以未装拆保存的，下次再进来，不能改成已装拆了
            if ((itemObj.chgflg == '15' || itemObj.chgflg == '35') && itemObj.irflg == '00' && itemObj.nonirrsn) {

            } else {
                itemObj.irflg = '01';//若资产编号不为空，则装拆标志为已装拆
                itemObj.nonirrsn = '';//未裝拆原因清空
                itemObj.nonirrsnintroduct = '';//未裝拆說明清空
            }
            if (!navigator.onLine) {
                if ($scope.zcInfo.readtyplist) {
                    // 有示数类型，则添加到此item中
                    var newReadList = [];
                    var obj = null;
                    var readtypList = $scope.zcInfo.readtyplist.split(";");
                    readtypList.forEach(function (item) {
                        (function (item) {
                            systemDropList.getDropLable('READTYPCD', item).then(function (label) {
                                obj = {
                                    readtyp: item,
                                    readtypMc: label || item,
                                    currread: "",
                                    asseno: $filter('shortenNumber')(itemObj.asseno),
                                    equiclas: itemObj.equiclas,// 设备类别
                                    instmtrid: itemObj.instdeviid,// 運行電能表標識
                                    meteequiuniqid: '',// 未知但是没有用到，默认为空
                                    mastandslavflg: itemObj.mastandslavflg,// 判断读数是否赋初始值
                                    needflg: 1 // needflg>0 增加必填标志
                                };
                                if ((obj.mastandslavflg != 1 || obj.needflg <= 0) && !obj.currread) {
                                    obj.currread = '0';
                                }
                                newReadList.push(obj);
                                itemObj.bm = newReadList;
                            });
                        })(item);
                    });
                } else {
                    itemObj.bm = [];
                }
            } else {
                var param = {
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 1,
                        "rowOfPage": 100
                    },
                    "vo": {
                        "asseno": $filter('lengthenNumber')(18, itemObj.asseno) || "",
                        "cntracctno": $filter('lengthenNumber')(12, $scope.zcInfo.contractno),
                        "equiclas": itemObj.equiclas || "",
                        "instmtrid": "",
                        "metepntno": itemObj.metepntno || "",
                        "wkordrno": $scope.zcInfo.wkordrno || ""
                    }
                };
                hyMui.loaderShow();
                zcgdblsService.queryNewOrUpdateReadList(param).then(function (data) {
                    hyMui.loaderHide();
                    if (data.readingList.length > 0) {
                        //判断录入的资产编号设备类型是否跟页面上展示的一样，如果不一样则提示出来
                        var equipinfo = data.readingList[0];
                        if (equipinfo && equipinfo.equityp && equipinfo.equityp != itemObj.equityp) {
                            hyMui.alert("該資產編號設備類型不是" + itemObj.equitypMc + ",請重新輸入", function () {
                                itemObj.asseno = "";
                                itemObj.irflg = '00';//若资产编号为空，则装拆标志为未装拆
                                $scope.$evalAsync();
                            });
                        } else {
                            if (equipinfo) {
                                itemObj.mnufctno = equipinfo.mnufctno; // 出厂编号
                                itemObj.manu = equipinfo.manu;// 厂家信息
                                systemDropList.getDropLable('MANUCD', equipinfo.manu).then(function (label) {
                                    itemObj.manuMc = label || equipinfo.manu;
                                });
                            }
                            // 有示数类型，则添加到此item中
                            var newReadList = [];
                            var obj = null;
                            data.readingList.forEach(function (item) {
                                (function (item) {
                                    systemDropList.getDropLable('READTYPCD', item.readtyp).then(function (label) {
                                        item.readtypMc = label || item.readtyp;
                                        obj = {
                                            readtyp: item.readtyp,
                                            readtypMc: item.readtypMc,
                                            currread: item.currread,
                                            asseno: $filter('shortenNumber')(itemObj.asseno),
                                            equiclas: itemObj.equiclas,// 设备类别
                                            instmtrid: itemObj.instdeviid,// 運行電能表標識
                                            meteequiuniqid: '',// 未知但是没有用到，默认为空
                                            mastandslavflg: itemObj.mastandslavflg,// 判断读数是否赋初始值
                                            needflg: item.needflg // needflg>0 增加必填标志
                                        };
                                        //抄表、拆除、更换前有上下限
                                        if (itemObj.chgflg == '15' || itemObj.chgflg == '35' || itemObj.chgflg == '00') {
                                            obj.expcread = item.expcread;
                                            obj.expccons = item.expccons;
                                            obj.minread = item.minread;
                                            obj.mincons = item.mincons;
                                            obj.maxread = item.maxread;
                                            obj.maxcons = item.maxcons;
                                        }
                                        if ((obj.mastandslavflg != 1 || obj.needflg <= 0) && !obj.currread) {
                                            obj.currread = '0';
                                        }
                                        newReadList.push(obj);
                                        itemObj.bm = newReadList;
                                    });
                                })(item);
                            });
                        }
                    } else {
                        itemObj.bm = [];
                    }
                }, function () {
                    hyMui.loaderHide();
                    //网络不好，从基本信息里readtyplist字段拿示数类型
                    if ($scope.zcInfo.readtyplist) {
                        // 有示数类型，则添加到此item中
                        var newReadList = [];
                        var obj = null;
                        var readtypList = $scope.zcInfo.readtyplist.split(";");
                        readtypList.forEach(function (item) {
                            (function (item) {
                                systemDropList.getDropLable('READTYPCD', item).then(function (label) {
                                    obj = {
                                        readtyp: item,
                                        readtypMc: label || item,
                                        currread: "",
                                        asseno: $filter('shortenNumber')(itemObj.asseno),
                                        equiclas: itemObj.equiclas,// 设备类别
                                        instmtrid: itemObj.instdeviid,// 運行電能表標識
                                        meteequiuniqid: '',// 未知但是没有用到，默认为空
                                        mastandslavflg: itemObj.mastandslavflg,// 判断读数是否赋初始值
                                        needflg: 1 // needflg>0 增加必填标志
                                    };
                                    if ((obj.mastandslavflg != 1 || obj.needflg <= 0) && !obj.currread) {
                                        obj.currread = '0';
                                    }
                                    newReadList.push(obj);
                                    itemObj.bm = newReadList;
                                });
                            })(item);
                        });
                    } else {
                        itemObj.bm = [];
                    }
                });
                // if (!itemObj.mnufctno) {
                //     queryFactoryInf(itemObj);// 查詢厂家信息
                // }
                // querySbdacs(itemObj);
            }
        };

        /**
         * 查询设备档案参数
         * @param item
         */
        function querySbdacs(item) {
            var param = {
                "equiptypVo": {
                    "equiclas": item.equiclas,
                    "equityp": item.equityp
                }
                // "masterDataVo": {
                //     "asseno": $filter('lengthenNumber')(18, item.asseno) || ""
                // }
            };
            hyMui.loaderShow();
            zcgdblsService.queryEquipmentParameter(param, 'check').then(function (data) {
                hyMui.loaderHide();
                // item.cd = [];item.val = [];
                // 循环cd，内部循环data，利用data[cd]与val比较，没找到则提示
                var cd = item.cd || [];
                var val = item.val || [];
                var bz = false;
                for (var i = 0; i < cd.length; i++) {
                    for (var prop in data) {
                        var flag = '';
                        var isOwn = data.hasOwnProperty(prop);
                        if (isOwn) {
                            var objVal = data[prop];
                            if (objVal) {
                                // 循环objVal
                                for (var key in objVal) {
                                    var exist = data.hasOwnProperty(key);
                                    if (exist) {
                                        // 确保比较的字段存在
                                        if (objVal[key]) {
                                            if (objVal[key] === val[i]) {
                                                flag = cd[i];
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (flag) {
                            var message = getMessage(flag, item);
                            hyMui.alert(message);
                            item.notPass = true;// 标记未通过
                            bz = true;// 用于结束最外层循环
                            break;
                        } else {
                            item.notPass = false;// 标记通过
                        }
                    }
                    if (bz) {
                        break;
                    }
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        function getMessage(parameter, item) {
            var message = '';
            switch (parameter) {
                case 'curtranrati':
                    message = 'TA變比檔案參數不匹配';
                    item.tabb = true;
                    break;
                case 'volttranrati':
                    message = 'TV變比檔案參數不匹配';
                    item.tabb = false;
                    break;
                case 'equiclas':
                    message = '設備類別檔案參數不匹配';
                    break;
                case 'phasln':
                    message = '相線檔案參數不匹配';
                    break;
                case 'mtrinstmde':
                    message = '安裝方式檔案參數不匹配';
                    break;
                case 'nomcur':
                    message = '標定電流檔案參數不匹配';
                    break;
                case 'phas':
                    message = '相別檔案參數不匹配';
                    break;
                default:
                    message = '檔案參數不匹配';
                    break;
            }
            return message;
        }

        function init() {
            getDropList();// 初始化下拉值
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                if (fromPage === 'pllr') {
                    // 批量装拆信息录入（传递）
                    $scope.zcInfo = passData.zcInfo || {};
                    $scope.dnbList = passData.dnbList || [];// 电能表信息
                    $scope.dsList = passData.dsList || [];// 电能表读数信息
                    $scope.hgqList = passData.hgqList || [];// 互感器
                    $scope.dlqList = passData.dlqList || [];// 断路器
                    $scope.xzsRList = passData.xzsRList || [];
                    $scope.ccsRList = passData.ccsRList || [];
                    $scope.xzsList = passData.xzsList || [];
                    $scope.ccsList = passData.ccsList || [];
                } else {
                    // 装拆信息录入（传递）
                    PassOrderService.getPassOrder(orders.wkordrno).then(function (result) {
                        if (result && result.orderInfo) {
                            var orderInfo = JSON.parse(result.orderInfo);
                            $scope.zcInfo = orderInfo.zcInfo || {};
                            $scope.dnbList = orderInfo.dnbList || [];// 电能表信息
                            $scope.dsList = orderInfo.dsList || [];// 电能表读数信息
                            $scope.hgqList = orderInfo.hgqList || [];// 互感器
                            $scope.dlqList = orderInfo.dlqList || [];// 断路器
                            $scope.xzsRList = orderInfo.xzsRList || [];
                            $scope.ccsRList = orderInfo.ccsRList || [];
                            $scope.xzsList = orderInfo.xzsList || [];
                            $scope.ccsList = orderInfo.ccsList || [];
                        } else {
                            hyMui.alert('暫無數據');
                        }
                    });
                }
            } else if (fromPage === 'pllr') {
                // 批量装拆信息录入：
                if (network) {
                    // 无网络批量装拆信息录入（初始化）
                    $scope.zcInfo = passData.zcInfo || {};
                    $scope.dnbList = passData.dnbList || [];
                    $scope.dsList = passData.dsList || [];
                    $scope.hgqList = passData.hgqList || [];
                    $scope.dlqList = passData.dlqList || [];
                    $scope.xzsRList = passData.xzsRList || [];
                    $scope.ccsRList = passData.ccsRList || [];
                    $scope.xzsList = passData.xzsList || [];
                    $scope.ccsList = passData.ccsList || [];
                    translateDate();
                    $scope.anwzData = passData.anwzData || [];// 设备位置
                } else {
                    // 有网络批量装拆信息录入（初始化）
                    commonDeal(passData);
                    // 循环加载其他任务，并组装每个任务中的数据（用于无网络或网络异常的保存）
                    for (var j = 0; j < offlineTaskList.length; j++) {
                        var taskSon = offlineTaskList[j].bljm;
                        commonPllr(taskSon, orders, offlineTaskList);
                    }
                }
            } else {
                // 装拆信息录入：
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(orders.wkordrno).then(function (result) {
                    if (result || !navigator.onLine) {
                        getOfflineInfo('local');
                    } else {
                        var wkor = {
                            "wkordrno": task.wkordrno
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
                    $scope.dnbList = orderInfo.dnbList || [];
                    $scope.dsList = orderInfo.dsList || [];
                    $scope.hgqList = orderInfo.hgqList || [];
                    $scope.dlqList = orderInfo.dlqList || [];
                    $scope.xzsRList = orderInfo.xzsRList || [];
                    $scope.ccsRList = orderInfo.ccsRList || [];
                    $scope.xzsList = orderInfo.xzsList || [];
                    $scope.ccsList = orderInfo.ccsList || [];
                    translateDate();
                    $scope.anwzData = orderInfo.anwzData || [];// 设备位置
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
            for (var i = 0; i < $scope.dsList.length; i++) {
                $scope.dsList[i].asseno = $filter('shortenNumber')($scope.dsList[i].asseno);// 去零
                !function (i) {
                    systemDropList.getDropLable('READTYPCD', $scope.dsList[i].readtyp).then(function (label) {
                        $scope.dsList[i].readtypMc = label || $scope.dsList[i].readtyp;
                    });
                }(i)
            }
            for (var i = 0; i < $scope.dnbList.length; i++) {
                if ($scope.dnbList[i].begin) {
                    (function (i) {
                        // 翻译主副标志
                        systemDropList.getDropLable('MASTANDSLAVFLGCD', $scope.dnbList[i].begin.mastandslavflg).then(function (label) {
                            $scope.dnbList[i].begin.mastandslavflgMc = label || $scope.dnbList[i].begin.mastandslavflg;
                        });
                        // 翻译设备类型
                        systemDropList.getDropLable('EQUITYPCD', $scope.dnbList[i].begin.equityp).then(function (label) {
                            $scope.dnbList[i].begin.equitypMc = label || $scope.dnbList[i].begin.equityp;
                        });
                        if ($scope.dnbList[i].begin.bm instanceof Array) {
                            for (var a = 0; a < $scope.dnbList[i].begin.bm.length; a++) {
                                (function (a) {
                                    // 翻译示数
                                    systemDropList.getDropLable('READTYPCD', $scope.dnbList[i].begin.bm[a].readtyp).then(function (label) {
                                        $scope.dnbList[i].begin.bm[a].readtypMc = label || $scope.dnbList[i].begin.bm[a].readtyp;
                                    });
                                })(a)
                            }
                        }
                    })(i);
                }
                if ($scope.dnbList[i].end) {
                    (function (i) {
                        // 翻译主副标志
                        systemDropList.getDropLable('MASTANDSLAVFLGCD', $scope.dnbList[i].end.mastandslavflg).then(function (label) {
                            $scope.dnbList[i].end.mastandslavflgMc = label || $scope.dnbList[i].end.mastandslavflg;
                        });
                        // 翻译设备类型
                        systemDropList.getDropLable('EQUITYPCD', $scope.dnbList[i].end.equityp).then(function (label) {
                            $scope.dnbList[i].end.equitypMc = label || $scope.dnbList[i].end.equityp;
                        });
                        if ($scope.dnbList[i].end.manu) {
                            systemDropList.getDropLable('MANUCD', $scope.dnbList[i].end.manu).then(function (label) {
                                $scope.dnbList[i].end.manuMc = label || $scope.dnbList[i].end.manu;
                            });
                        }
                        if ($scope.dnbList[i].end.phasln) {
                            systemDropList.getDropLable('PHASLNCD', $scope.dnbList[i].end.phasln).then(function (label) {
                                $scope.dnbList[i].end.phaslnMc = label || $scope.dnbList[i].end.phasln;
                            });
                        }
                        if ($scope.dnbList[i].end.curtranrati) {
                            systemDropList.getDropLable('CURTRANRATICD', $scope.dnbList[i].end.curtranrati).then(function (label) {
                                $scope.dnbList[i].end.curtranratiMc = label || $scope.dnbList[i].end.curtranrati;
                            });
                        }
                        if ($scope.dnbList[i].end.nomcur) {
                            systemDropList.getDropLable('NOMCURCD', $scope.dnbList[i].end.nomcur).then(function (label) {
                                $scope.dnbList[i].end.nomcurMc = label || $scope.dnbList[i].end.nomcur;
                            });
                        }
                        if ($scope.dnbList[i].end.nomvolt) {
                            systemDropList.getDropLable('NOMVOLTCD', $scope.dnbList[i].end.nomvolt).then(function (label) {
                                $scope.dnbList[i].end.nomvoltMc = label || $scope.dnbList[i].end.nomvolt;
                            });
                        }
                        if ($scope.dnbList[i].end.volttranrati) {
                            systemDropList.getDropLable('VOLTTRANRATICD', $scope.dnbList[i].end.volttranrati).then(function (label) {
                                $scope.dnbList[i].end.volttranratiMc = label || $scope.dnbList[i].end.volttranrati;
                            });
                        }
                        if ($scope.dnbList[i].end.bm instanceof Array) {
                            for (var a = 0; a < $scope.dnbList[i].end.bm.length; a++) {
                                (function (a) {
                                    // 翻译示数
                                    systemDropList.getDropLable('READTYPCD', $scope.dnbList[i].end.bm[a].readtyp).then(function (label) {
                                        $scope.dnbList[i].end.bm[a].readtypMc = label || $scope.dnbList[i].end.bm[a].readtyp;
                                    });
                                })(a)
                            }
                        }
                    })(i);
                }
                if (!$scope.dnbList[i].begin && !$scope.dnbList[i].end) {
                    (function (i) {
                        // 翻译主副标志
                        systemDropList.getDropLable('MASTANDSLAVFLGCD', $scope.dnbList[i].mastandslavflg).then(function (label) {
                            $scope.dnbList[i].mastandslavflgMc = label || $scope.dnbList[i].mastandslavflg;
                        });
                        // 翻译设备类型
                        systemDropList.getDropLable('EQUITYPCD', $scope.dnbList[i].equityp).then(function (label) {
                            $scope.dnbList[i].equitypMc = label || $scope.dnbList[i].equityp;
                        });
                        if ($scope.dnbList[i].manu) {
                            systemDropList.getDropLable('MANUCD', $scope.dnbList[i].manu).then(function (label) {
                                $scope.dnbList[i].manuMc = label || $scope.dnbList[i].manu;
                            });
                        }
                        if ($scope.dnbList[i].phasln) {
                            systemDropList.getDropLable('PHASLNCD', $scope.dnbList[i].phasln).then(function (label) {
                                $scope.dnbList[i].phaslnMc = label || $scope.dnbList[i].phasln;
                            });
                        }
                        if ($scope.dnbList[i].curtranrati) {
                            systemDropList.getDropLable('CURTRANRATICD', $scope.dnbList[i].curtranrati).then(function (label) {
                                $scope.dnbList[i].curtranratiMc = label || $scope.dnbList[i].curtranrati;
                            });
                        }
                        if ($scope.dnbList[i].volttranrati) {
                            systemDropList.getDropLable('VOLTTRANRATICD', $scope.dnbList[i].volttranrati).then(function (label) {
                                $scope.dnbList[i].volttranratiMc = label || $scope.dnbList[i].volttranrati;
                            });
                        }
                        if ($scope.dnbList[i].nomcur) {
                            systemDropList.getDropLable('NOMCURCD', $scope.dnbList[i].nomcur).then(function (label) {
                                $scope.dnbList[i].nomcurMc = label || $scope.dnbList[i].nomcur;
                            });
                        }
                        if ($scope.dnbList[i].nomvolt) {
                            systemDropList.getDropLable('NOMVOLTCD', $scope.dnbList[i].nomvolt).then(function (label) {
                                $scope.dnbList[i].nomvoltMc = label || $scope.dnbList[i].nomvolt;
                            });
                        }
                        if ($scope.dnbList[i].bm instanceof Array) {
                            for (var a = 0; a < $scope.dnbList[i].bm.length; a++) {
                                (function (a) {
                                    // 翻译示数
                                    systemDropList.getDropLable('READTYPCD', $scope.dnbList[i].bm[a].readtyp).then(function (label) {
                                        $scope.dnbList[i].bm[a].readtypMc = label || $scope.dnbList[i].bm[a].readtyp;
                                    });
                                })(a)
                            }
                        }
                    })(i);
                }
            }
            for (var i = 0; i < $scope.hgqList.length; i++) {
                if ($scope.hgqList[i].begin) {
                    (function (i) {
                        systemDropList.getDropLable('EQUITYPCD', $scope.hgqList[i].begin.equityp).then(function (label) {
                            $scope.hgqList[i].begin.equitypMc = label || $scope.hgqList[i].begin.equityp;
                        });
                        // 翻译主副标志
                        systemDropList.getDropLable('MASTANDSLAVFLGCD', $scope.hgqList[i].begin.mastandslavflg).then(function (label) {
                            $scope.hgqList[i].begin.mastandslavflgMc = label || $scope.hgqList[i].begin.mastandslavflg;
                        });
                    }(i));
                }
                if ($scope.hgqList[i].end) {
                    (function (i) {
                        systemDropList.getDropLable('EQUITYPCD', $scope.hgqList[i].end.equityp).then(function (label) {
                            $scope.hgqList[i].end.equitypMc = label || $scope.hgqList[i].end.equityp;
                        });
                        // 翻译主副标志
                        systemDropList.getDropLable('MASTANDSLAVFLGCD', $scope.hgqList[i].end.mastandslavflg).then(function (label) {
                            $scope.hgqList[i].end.mastandslavflgMc = label || $scope.hgqList[i].end.mastandslavflg;
                        });
                        if ($scope.hgqList[i].end.curtranrati) {
                            systemDropList.getDropLable('CURTRANRATICD', $scope.hgqList[i].end.curtranrati).then(function (label) {
                                $scope.hgqList[i].end.curtranratiMc = label || $scope.hgqList[i].end.curtranrati;
                            });
                        }
                        if ($scope.hgqList[i].end.volttranrati) {
                            systemDropList.getDropLable('VOLTTRANRATICD', $scope.hgqList[i].end.volttranrati).then(function (label) {
                                $scope.hgqList[i].end.volttranratiMc = label || $scope.hgqList[i].end.volttranrati;
                            });
                        }
                    }(i));
                }
                if (!$scope.hgqList[i].begin && !$scope.hgqList[i].end) {
                    (function (i) {
                        systemDropList.getDropLable('EQUITYPCD', $scope.hgqList[i].equityp).then(function (label) {
                            $scope.hgqList[i].equitypMc = label || $scope.hgqList[i].equityp;
                        });
                        // 翻译主副标志
                        systemDropList.getDropLable('MASTANDSLAVFLGCD', $scope.hgqList[i].mastandslavflg).then(function (label) {
                            $scope.hgqList[i].mastandslavflgMc = label || $scope.hgqList[i].mastandslavflg;
                        });
                        if ($scope.hgqList[i].curtranrati) {
                            systemDropList.getDropLable('CURTRANRATICD', $scope.hgqList[i].curtranrati).then(function (label) {
                                $scope.hgqList[i].curtranratiMc = label || $scope.hgqList[i].curtranrati;
                            });
                        }
                        if ($scope.hgqList[i].volttranrati) {
                            systemDropList.getDropLable('VOLTTRANRATICD', $scope.hgqList[i].volttranrati).then(function (label) {
                                $scope.hgqList[i].volttranratiMc = label || $scope.hgqList[i].volttranrati;
                            });
                        }
                    }(i));
                }
            }
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
            // 替换成规格参数的展示
            // var ggcsList = zcxxInfo.ggcsList || [];
            // addGgcs(ggcsList, zcxxInfo.mcbList);
            // addGgcs(ggcsList, zcxxInfo.mtrList);
            // addGgcs(ggcsList, zcxxInfo.induList);

            $scope.dsList = translationDsDrop(zcxxInfo.readList);// 电能表读数信息
            $scope.dlqList = getDlq(zcxxInfo.mcbList);// 断路器信息
            zhDnb(zcxxInfo.mtrList);// 电能表数据
            zhHgq(zcxxInfo.induList);// 互感器数据
            zhLockInfo(zcxxInfo.sealList);// 锁信息
        }

        /**
         * 增加规格参数，替换设备类型
         * @param ggcsList
         * @param sysSbList
         */
        function addGgcs(ggcsList, sysSbList) {
            if (ggcsList.length === 0 || sysSbList.length === 0) return;
            for (var i = 0; i < sysSbList.length; i++) {
                var ggcs = '';
                var cd = [];// 下拉cd
                var val = [];// 下拉值
                ggcsList.forEach(function (item) {
                    if (sysSbList[i].irtaskdetlno === item.irtaskdetlno) {
                        sysSbList[i].irequiparmid = item.irequiparmid;
                        var dmbm = item.parmcd.toLocaleUpperCase() + 'CD';
                        var dmbmLower = item.parmcd.toLocaleLowerCase();
                        var dmbmVal = item.parmval || '';
                        // 新装、更换后添加
                        if (sysSbList[i].chgflg === '10' || sysSbList[i].chgflg === '25') {
                            cd.push(dmbmLower);
                            val.push(dmbmVal);
                            (function (item, i, ggcs) {
                                systemDropList.getDropLable(dmbm, item.parmval).then(function (label) {
                                    ggcs += label + ';';
                                    sysSbList[i].ggcsMc = ggcs;
                                });
                            })(item, i, ggcs);
                        }
                    }
                });
                sysSbList[i].cd = cd;// 用于与档案参数比较
                sysSbList[i].val = val;// 用于与档案参数比较
            }
        }

        /**
         * 增加设备参数
         * @param item
         */
        function getEquipmentParameter(item) {
            var param = {
                "equiptypVo": {
                    "equiclas": item.equiclas,
                    "equityp": item.equityp
                }
                // "masterDataVo": {
                //     "asseno": $filter('lengthenNumber')(18, item.asseno) || ""
                // }
            };
            hyMui.loaderShow();
            zcgdblsService.queryEquipmentParameter(param).then(function (data) {
                hyMui.loaderHide();
                // 给此item增加设备参数字段
                item.curtranrati = data.curtranrati || '';
                item.nomcur = data.nomcur || '';
                item.nomvolt = data.nomvolt || '';
                item.volttranrati = data.volttranrati || '';
                item.phasln = data.phasln || '';
                item.mtrtyp = data.mtrtyp || '';
                item.mtrmult = data.mtrmult || '';
                if (item.curtranrati) {
                    systemDropList.getDropLable('CURTRANRATICD', item.curtranrati).then(function (label) {
                        item.curtranratiMc = label || item.curtranrati;
                    });
                }
                if (item.nomcur) {
                    systemDropList.getDropLable('NOMCURCD', item.nomcur).then(function (label) {
                        item.nomcurMc = label || item.nomcur;
                    });
                }
                if (item.nomvolt) {
                    systemDropList.getDropLable('NOMVOLTCD', item.nomvolt).then(function (label) {
                        item.nomvoltMc = label || item.nomvolt;
                    });
                }
                if (item.volttranrati) {
                    systemDropList.getDropLable('VOLTTRANRATICD', item.volttranrati).then(function (label) {
                        item.volttranratiMc = label || item.volttranrati;
                    });
                }
                if (item.phasln) {
                    systemDropList.getDropLable('PHASLNCD', item.phasln).then(function (label) {
                        item.phaslnMc = label || item.phasln;
                    });
                }
                switch (item.mtrtyp) {
                    case '01':
                        item.mtrtypMc = '感應式';
                        break;
                    case '02':
                        item.mtrtypMc = '電子式';
                        break;
                    case '03':
                        item.mtrtypMc = 'AMI';
                        break;
                    default:
                        item.mtrtypMc = item.mtrtyp;
                        break;
                }

            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 组合电能表数据
         * @param sysList
         */
        function zhDnb(sysList) {
            // 向电能表对象中添加錶码数组
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].asseno = $filter('shortenNumber')(sysList[i].asseno);// 去零
                // 以下两步操作保存是保存时需要用到的字段
                sysList[i].oprtr = rybs;
                sysList[i].wkordrno = task.wkordrno;
                sysList[i].fldtskid = $scope.zcInfo.fldtskid;
                sysList[i].ccbh = $filter('shortenNumber')(sysList[i].mnufctno);// 出厂编号（初始化可能会查询出来）去零
                // if (sysList[i].asseno) {
                //     queryFactoryInf(sysList[i]);// 查詢厂家信息
                // }
                // 增加设备参数,变更前的不需要查档案技术参数,通过资产编号查询档案技术参数
                // if(sysList[i].chgflg != '00' && sysList[i].asseno){
                getEquipmentParameter(sysList[i]);
                // }
                (function (i) {
                    // 翻译主副标志
                    systemDropList.getDropLable('MASTANDSLAVFLGCD', sysList[i].mastandslavflg).then(function (label) {
                        sysList[i].mastandslavflgMc = label || sysList[i].mastandslavflg;
                    });
                    // 翻译设备类型
                    systemDropList.getDropLable('EQUITYPCD', sysList[i].equityp).then(function (label) {
                        sysList[i].equitypMc = label || sysList[i].equityp;
                    });
                })(i);
                var bmList = [];
                // for (var j = 0; j < $scope.dsList.length; j++) {
                //     if (sysList[i].asseno === $scope.dsList[j].asseno) {
                //         $scope.dsList[j].equiclas = sysList[i].equiclas;// 设备类别
                //         $scope.dsList[j].instmtrid = sysList[i].instdeviid;// 運行電能表標識
                //         $scope.dsList[j].meteequiuniqid = '';// 未知但是没有用到，默认为空
                //         bmList.push($scope.dsList[j])
                //     }
                // }
                sysList[i].bm = bmList;
            }
            $scope.dnbList = combinationSbxxNew(sysList);// 电能表信息
            //若初始化有资产编号但是没有示数，则调查询示数接口
            for (var i = 0; i < $scope.dnbList.length; i++) {
                var item = $scope.dnbList[i].end || $scope.dnbList[i];
                var readBegin = $scope.dnbList[i].begin;//变更前的示数也要显示出来
                if (item && item.asseno && (!item.bm || item.bm.length === 0)) {
                    $scope.queryRead(item);
                }
                if (readBegin && readBegin.asseno && (!item.bm || item.bm.length === 0)) {
                    $scope.queryRead(readBegin);
                }
            }
        }

        /**
         * 组合互感器数据
         * @param sysList
         */
        function zhHgq(sysList) {
            // 翻译设备类型
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].asseno = $filter('shortenNumber')(sysList[i].asseno);// 去零
                // 以下两步操作保存是保存时需要用到的字段
                sysList[i].oprtr = rybs;
                sysList[i].wkordrno = task.wkordrno;
                sysList[i].fldtskid = $scope.zcInfo.fldtskid;
                // 增加设备参数,变更前的不需要查档案技术参数,通过资产编号查询档案技术参数
                // if(sysList[i].chgflg != '00' && sysList[i].asseno){
                getEquipmentParameter(sysList[i]);
                // }
                (function (i) {
                    systemDropList.getDropLable('EQUITYPCD', sysList[i].equityp).then(function (label) {
                        sysList[i].equitypMc = label || sysList[i].equityp;
                    });
                    // 翻译主副标志
                    systemDropList.getDropLable('MASTANDSLAVFLGCD', sysList[i].mastandslavflg).then(function (label) {
                        sysList[i].mastandslavflgMc = label || sysList[i].mastandslavflg;
                    });
                }(i));
            }
            $scope.hgqList = combinationSbxxNew(sysList);// 组合互感器数据
        }

        /**
         * 斷路器篩選：00（原始）的不展示
         * @param sysList
         * @returns {*}
         */
        function getDlq(sysList) {
            for (var i = 0; i < sysList.length; i++) {
                if (!sysList[i].mcbnbr) {
                    sysList[i].mcbnbr = '1';
                }
            }
            return sysList.filter(function (item) {
                if (item.chgflg !== '00' && item.chgflg !== '20') return item;
            });
        }

        /**
         * 翻译电表示数类型
         * @param sysList
         * @returns {*}
         */
        function translationDsDrop(sysList) {
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].asseno = $filter('shortenNumber')(sysList[i].asseno);// 去零
                !function (i) {
                    systemDropList.getDropLable('READTYPCD', sysList[i].readtyp).then(function (label) {
                        sysList[i].readtypMc = label || sysList[i].readtyp;
                    });
                }(i)
            }
            return sysList;
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
         * 组合数据，将更换设备数据组合在一起
         * 00原始 10新装 15拆除 20变更前 25变更后 35抄表后 instdeviid 運行電能表標識
         * @param list
         * @returns {Array}
         */
        function combinationSbxxNew(list) {
            var newzcxxInfo = [];
            for (var i = 0; i < list.length; i++) {
                var changeJson = {};
                if (i === 0) {
                    if (list[i].chgflg === '00') {
                        changeJson.begin = list[i];
                        newzcxxInfo.push(changeJson);
                    } else if (list[i].chgflg === '25') {
                        changeJson.end = list[i];
                        newzcxxInfo.push(changeJson);
                    } else {
                        newzcxxInfo.push(list[i]);
                    }
                } else {
                    if (list[i].chgflg === '10' || list[i].chgflg === '15' || list[i].chgflg === '35') {
                        newzcxxInfo.push(list[i]);
                    } else if (list[i].chgflg === '00' || list[i].chgflg === '25') {
                        for (var j = 0; j < newzcxxInfo.length; j++) {
                            if (newzcxxInfo[j].begin && newzcxxInfo[j].begin.instdeviid === list[i].instdeviid) {
                                newzcxxInfo[j].end = list[i];
                                break;
                            } else if (newzcxxInfo[j].end && newzcxxInfo[j].end.instdeviid === list[i].instdeviid) {
                                newzcxxInfo[j].begin = list[i];
                                break;
                            } else if (j === newzcxxInfo.length - 1) {
                                if (list[i].chgflg === '00') {
                                    changeJson.begin = list[i];
                                    newzcxxInfo.push(changeJson);
                                } else if (list[i].chgflg === '25') {
                                    changeJson.end = list[i];
                                    newzcxxInfo.push(changeJson);
                                }
                                break;
                            }
                        }
                    }
                }
            }
            for (var i = 0; i < newzcxxInfo.length; i++) {
                if (newzcxxInfo[i] && newzcxxInfo[i].begin && !newzcxxInfo[i].end) {
                    newzcxxInfo.splice(i, 1);
                    --i;
                }
            }
            return newzcxxInfo;
        }

        /**
         * 选择装拆标志
         */
        $scope.showDescription = function (value, iremObj, flag) {
            if (value == '00' && (iremObj.chgflg == '10' || iremObj.chgflg == '25')) {
                // 新装或变更后的裝拆標志是未装拆，资产编号、出厂编号、厂家都清空
                iremObj.asseno = "";
                iremObj.ccbh = "";
                iremObj.manu = "";
                iremObj.manuMc = "";
            } else if (value == '01' && !iremObj.asseno) {//已装拆
                // 已装拆，清空未装拆说明，校验资产编号和出厂编号有没有值，没有值则提示出来；
                iremObj.nonirrsn = '';
                iremObj.nonirrsnintroduct = '';
                if (flag === 'dnb') {
                    if (!iremObj.asseno && !iremObj.ccbh) {
                        hyMui.toast({message: '請錄入資產編號和出廠編號'});
                    } else if (!iremObj.asseno) {
                        hyMui.toast({message: '請錄入資產編號'});
                    } else if (!iremObj.ccbh) {
                        hyMui.toast({message: '請錄入出廠編號'});
                    }
                } else if ($scope.SortType === 2) {//互感器
                    if (!iremObj.asseno) {
                        hyMui.toast({message: '請錄入資產編號'});
                    }
                }
            }
        };
        /**
         * 互感器資產編號失去焦點
         * @param itemObj
         */
        $scope.doSomething = function (itemObj) {
            if (!itemObj.asseno) {
                itemObj.irflg = '00';//若资产编号为空，则装拆标志为未装拆
                return;
            }
            itemObj.irflg = '01';//若资产编号不为空，则装拆标志为已装拆
            itemObj.nonirrsn = '';//未裝拆原因清空
            itemObj.nonirrsnintroduct = '';//未裝拆說明清空
            // querySbdacs(itemObj);
        };

        /**
         * 校验电能表出厂编号
         * @param item
         */
        $scope.checkCcbh = function (item) {
            if (item.irflg === '01') {
                // 是已装拆，校验资产编号和出厂编号有没有值，没有值则提示出来；
                if (!item.asseno) {
                    hyMui.toast({message: '請錄入資產編號'});
                    return;
                }
                if (!item.ccbh) {
                    hyMui.toast({message: '請錄入出廠編號'});
                    return;
                }
                if (!item.asseno && !item.ccbh) {
                    hyMui.toast({message: '請錄入資產編號和出廠編號'});
                    return;
                }
            } else {
                return;
            }

            // 判断是否存在系统编号，不存在则先查询再比较，存在则直接比较
            if (!item.mnufctno) {
                queryFactoryInf(item, function (obj) {
                    if (!obj.mnufctno) return;
                    if (obj.mnufctno !== item.ccbh) {
                        hyMui.toast({message: '輸入的出廠編號和該設備不匹配，請重新輸入'});
                        // item.ccbh="";
                    }
                })
            } else {
                if (item.mnufctno !== item.ccbh) {
                    hyMui.toast({message: '輸入的出廠編號和該設備不匹配，請重新輸入'});
                }
            }
        };

        /**
         * 查询电能表厂家信息
         * @param item
         * @param callback
         */
        function queryFactoryInf(item, callback) {
            if (!item.asseno) return;
            var param = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "vo": {
                    "asseno": $filter('lengthenNumber')(18, item.asseno),
                    "equiclas": item.equiclas,
                    "equityp": item.equityp
                }
            };
            hyMui.loaderShow();
            zcgdblsService.queryEquipmentMaster(param).then(function (data) {
                hyMui.loaderHide();
                item.mnufctno = data.mnufctno; // 出厂编号
                item.manu = data.manu;// 厂家信息
                systemDropList.getDropLable('MANUCD', item.manu).then(function (label) {
                    item.manuMc = label || item.manu;
                });
                callback && callback(item);
            }, function () {
                hyMui.loaderHide();
            });
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
         * 还原数据，用于保存操作
         * @param list
         */
        function reductionSbxx(list) {
            var reductionArray = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].begin) {
                    list[i].begin.asseno = $filter('lengthenNumber')(18, list[i].begin.asseno);
                    reductionArray.push(list[i].begin);
                    if (list[i].end) {
                        list[i].end.asseno = $filter('lengthenNumber')(18, list[i].end.asseno);
                        reductionArray.push(list[i].end);
                    }
                } else {
                    list[i].asseno = $filter('lengthenNumber')(18, list[i].asseno);
                    reductionArray.push(list[i]);
                }
            }
            return reductionArray.filter(function (item) {
                if (item.chgflg !== '00') return item;
            });
        }

        /**
         * 保存信息
         */
        $scope.saveAll = function () {
            var param = {};
            if (!$scope.zcInfo.apptbegtm && !$scope.zcInfo.apptendtm && !$scope.zcInfo.ctctpers && !$scope.zcInfo.wkordrtele) {

            } else if ($scope.zcInfo.apptbegtm && $scope.zcInfo.apptendtm && $scope.zcInfo.ctctpers && $scope.zcInfo.wkordrtele) {
                param.sevapptList = checkYyxx();// 预约信息
                if (param.sevapptList && param.sevapptList.length === 0) return;
            } else {//有一個字段不為空
                hyMui.alert("請填寫預約信息其他字段");
                return;
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
                if (!flag) {
                    nlockAry.push(lockAry[a]);
                }
            }
            if (nlockAry.length !== lockAry.length) {
                hyMui.alert('存在重複的鎖編號，請重新錄入');
                return;
            }
            var nowTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');// 当前时间
            // 電能表 互感器 MCB($scope.mcb) 保險絲($scope.bxs) 封印($scope.xzsList,$scope.ccsList)
            var dnb = reductionSbxx($scope.dnbList);// 電能表（不包含00的数据）
            var hgq = reductionSbxx($scope.hgqList);// 互感器（不包含00的数据）
            // 处理读数List：在初始化时增加一部分字段，在这里保存时增加一部分字段
            var readList = [];// 示数数组
            for (var x = 0; x < dnb.length; x++) {
                //针对抄表、拆除、变更后、新装，如果选择的是未装拆，则不保存表码
                if (dnb[x].irflg == '00' && (dnb[x].chgflg == '15' || dnb[x].chgflg == '35' || dnb[x].chgflg == '10' || dnb[x].chgflg == '25')) {
                    continue;
                }
                if (dnb[x].bm.length > 0) {
                    for (var i = 0; i < dnb[x].bm.length; i++) {
                        dnb[x].bm[i].oprtr = rybs;
                        dnb[x].bm[i].readtm = nowTime;
                        dnb[x].bm[i].wkordrno = task.wkordrno;
                        //主表并且是已装拆则必填
                        if (dnb[x].irflg == '01' && dnb[x].mastandslavflg == 1 && dnb[x].bm[i].needflg > 0 && !dnb[x].bm[i].currread && dnb[x].bm[i].currread !== 0) {
                            hyMui.alert('存在未錄入的表碼，請錄入');
                            return;
                        }
                        if (dnb[x].bm[i].currread || dnb[x].bm[i].currread === 0) {
                            readList.push(dnb[x].bm[i]);
                        }
                    }
                }
            }
            //增加变更前的表码保存
            for (var i = 0; i < $scope.dnbList.length; i++) {
                var item = $scope.dnbList[i].begin;
                if ($scope.dnbList[i].end && $scope.dnbList[i].end.irflg == '01') {
                    if (item && item.bm && item.bm.length > 0) {//更换前
                        for (var j = 0; j < item.bm.length; j++) {
                            if (item.bm[j].currread || item.bm[j].currread === 0) {
                                item.bm[j].oprtr = rybs;
                                item.bm[j].readtm = nowTime;
                                item.bm[j].wkordrno = task.wkordrno;
                                readList.push(item.bm[j]);
                            }
                        }
                    }
                }
            }
            // 读数数组给资产编号补零
            readList.forEach(function (item) {
                item.asseno = $filter('lengthenNumber')(18, item.asseno);// 补零
            });
            // 断路器字段赋值（不包含00的数据）
            $scope.dlqList.forEach(function (item) {
                item.mcbinstloc = item.equilocno;// 安裝位置（低压断路器）
                item.equiclas = '39';// 设备类别:固定39
                item.equityp = item.mcbtyp;// 设备类型
                item.oprtr = rybs;
                item.wkordrno = task.wkordrno;
                item.fldtskid = $scope.zcInfo.fldtskid;
            });
            //將页面输入的出厂编号保存上去
            dnb.forEach(function (item) {
                item.mnufctno = $filter('lengthenNumber')(18, item.ccbh);// 补零出厂编号
            });
            // 设备对象数组拼接
            var sbList = dnb.concat(hgq, $scope.dlqList);
            sbList.forEach(function (item) {
                item.irdt = nowTime;// 当前时间;
            });
            var wzcsblb = null;
            var sfwzc = sbList.some(function (item) {
                if (item.irflg === '00' && !item.nonirrsn) {
                    wzcsblb = item.equiclas;
                    return true;
                }
            });
            if (sfwzc && wzcsblb) {
                if (wzcsblb == '01') {
                    hyMui.alert('存在未裝拆的電能表，請選擇未裝拆原因');
                    $scope.SortType = 1;
                } else if (wzcsblb == '02') {
                    hyMui.alert('存在未裝拆的互感器，請選擇未裝拆原因');
                    $scope.SortType = 2;
                } else if (wzcsblb == '39') {
                    hyMui.alert('存在未裝拆的斷路器，請選擇未裝拆原因');
                    $scope.SortType = 3;
                } else {
                    hyMui.alert('存在未裝拆的設備，請選擇未裝拆原因');
                }
                return;
            }
            // 校验未装拆说明是否填写，如果选择不是other，则不显示必填
            var wzcsm = sbList.some(function (item) {
                if (item.nonirrsn === '19' && !item.nonirrsnintroduct) {
                    wzcsblb = item.equiclas;
                    return true;
                }
            });
            if (wzcsm && wzcsblb) {
                if (wzcsblb == '01') {
                    hyMui.alert('請填寫電能表未裝拆說明');
                    $scope.SortType = 1;
                } else if (wzcsblb == '02') {
                    hyMui.alert('請填寫互感器未裝拆說明');
                    $scope.SortType = 2;
                } else if (wzcsblb == '39') {
                    hyMui.alert('請填寫斷路器未裝拆說明');
                    $scope.SortType = 3;
                } else {
                    hyMui.alert('請填寫未裝拆說明');
                }
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
            //封印入參缺少計量點編號賦值
            var jldbh = "";
            if (sbList.length > 0) {
                sbList.some(function (item) {
                    if (item.metepntno) {
                        jldbh = item.metepntno;
                        return true;
                    }
                });
            }
            for (var i = 0; i < lockInfoList.length; i++) {
                if (!lockInfoList[i].sealno) {
                    hyMui.alert('請錄入鎖編號');
                    return;
                }
                if (!lockInfoList[i].metepntno) {
                    lockInfoList[i].metepntno = jldbh;
                }
            }
            // 构造入参
            param.svireqprecdinfoList = sbList;// 设备
            param.svirsealrecinfoList = lockInfoList;// 封印
            param.svrgsreadirinfoList = readList;// 读数

            //保存任務備註信息
            if ($scope.zcInfo.rema) {
                param.fldtskVO = {
                    "rema": $scope.zcInfo.rema,
                    "fldtskid": $scope.zcInfo.fldtskid,
                    "operatorid": rybs
                };
            }
            // 离线缓存工单信息和入参
            if (!navigator.onLine) {
                if (fromPage === 'pllr') {
                    savePlzcOfflineInfo(param);
                } else {
                    saveOfflineInfo(param);
                }
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
                        // 先从本地数据库取数据，移除并添加
                        var passLocalPllr = [];
                        var rwlb = {
                            wkordrno: orders.wkordrno,
                            contractno: orders.contractno,
                            premno: orders.premno
                        };
                        var pageOrderInfo = {
                            zcInfo: $scope.zcInfo,
                            dnbList: $scope.dnbList,
                            dsList: $scope.dsList,
                            hgqList: $scope.hgqList,
                            dlqList: $scope.dlqList,
                            xzsRList: $scope.xzsRList,
                            ccsRList: $scope.ccsRList,
                            xzsList: $scope.xzsList,
                            ccsList: $scope.ccsList,
                            premno: orders.premno
                        };
                        if (fromPage === 'pllr') {
                            PassOrderService.getPassOrder(orders.wkordrno).then(function (result) {
                                if (result && result.orderInfo) {
                                    var orderInfo = JSON.parse(result.orderInfo);
                                    passLocalPllr = orderInfo || [];
                                }
                                var savePllr = {
                                    rwlb: rwlb,
                                    bljm: pageOrderInfo
                                };
                                var existIndex = null;
                                var existFlag = passLocalPllr.some(function (item, index) {
                                    existIndex = index;
                                    return item.rwlb.premno === orders.premno
                                });
                                existFlag ? passLocalPllr.splice(existIndex, 1, savePllr) : passLocalPllr.push(savePllr);
                                // passLocalPllr格式 [{rwlb:{},bljm:{}},{rwlb:{},bljm:{}}]
                                PassOrderService.savePassOrder(passLocalPllr, orders);
                            });
                            // 刪除此工单入参本地数据
                            OfflineParamService.delOfflineParam(task.wkordrno);
                        } else {
                            PassOrderService.savePassOrder(pageOrderInfo, orders); // 本地緩存传递工单数据
                            // 刪除此工单入参本地数据
                            OfflineParamService.delOfflineParam(task.wkordrno);
                        }
                        hyMui.alert('保存成功');
                    }, function () {
                        if (fromPage === 'pllr') {
                            savePlzcOfflineInfo(null);
                        } else {
                            saveOfflineInfo(null);
                        }
                        hyMui.loaderHide();
                        hyMui.alert('圖片上傳中斷');
                    });
                    $rootScope.$broadcast("LSJD_ZCLR_SUCCESS", true);// 通知临时检定保存成功
                } else {
                    hyMui.loaderHide();
                    var message = data.rsltinfo && data.rsltinfo.indexOf('Save failure') < 0 ? "保存失敗," + data.rsltinfo : "保存失敗";
                    hyMui.alert(message);
                }
                // 保存成功后去零
                addZeroBeforeSave();
            }, function () {
                // 保存 param 与 orderInfo
                if (fromPage === 'pllr') {
                    savePlzcOfflineInfo(param);
                } else {
                    saveOfflineInfo(param);
                }
                // 保存成功后去零
                addZeroBeforeSave();
                hyMui.loaderHide();
            });
        };

        function addZeroBeforeSave() {
            $scope.dnbList.forEach(function (item) {
                if (item.end && item.end.asseno) {
                    item.end.asseno = $filter('shortenNumber')(item.end.asseno);
                } else if (item.begin && item.begin.asseno) {
                    item.begin.asseno = $filter('shortenNumber')(item.begin.asseno);
                } else if (item.asseno) {
                    item.asseno = $filter('shortenNumber')(item.asseno);
                }
            });
            $scope.hgqList.forEach(function (item) {
                if (item.end && item.end.asseno) {
                    item.end.asseno = $filter('shortenNumber')(item.end.asseno);
                } else if (item.begin && item.begin.asseno) {
                    item.begin.asseno = $filter('shortenNumber')(item.begin.asseno);
                } else if (item.asseno) {
                    item.asseno = $filter('shortenNumber')(item.asseno);
                }
            });
        }

        /**
         * 离线缓存工单信息和入参
         * @param param 入参数据
         */
        function saveOfflineInfo(param) {
            if (fromPage === 'lsjd') {
                var lsjdPageData = mainNavi.getCurrentPage().options.pageData || {};// 临时检定界面数据
                var lsjdPhoto = mainNavi.getCurrentPage().options.lsjdPhoto || {};// 临时检定照片
                OrderCommonService.saveOrderAndParam(lsjdPageData, orders, null, lsjdPhoto, 'lsjd');
            } else if (fromPage === 'gzcl') {
                var gzclPageData = mainNavi.getCurrentPage().options.pageData || {};// 故障处理界面数据
                OrderCommonService.saveOrderAndParam(gzclPageData, orders, null, null, 'gzcl');
            }
            var offlineOrderInfo = {
                zcInfo: $scope.zcInfo,
                dnbList: $scope.dnbList,
                dsList: $scope.dsList,
                hgqList: $scope.hgqList,
                dlqList: $scope.dlqList,
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
         * 批量装拆离线工单信息和入参
         * @param param
         */
        function savePlzcOfflineInfo(param) {
            // 先从本地数据库取数据，移除并添加
            var passLocalPllr = [];
            var rwlb = {
                wkordrno: orders.wkordrno,
                contractno: orders.contractno,
                premno: orders.premno
            };
            var pageOrderInfo = {
                zcInfo: $scope.zcInfo,
                dnbList: $scope.dnbList,
                dsList: $scope.dsList,
                hgqList: $scope.hgqList,
                dlqList: $scope.dlqList,
                xzsRList: $scope.xzsRList,
                ccsRList: $scope.ccsRList,
                xzsList: $scope.xzsList,
                ccsList: $scope.ccsList,
                premno: orders.premno
            };
            if (fromPage === 'pllr') {
                OfflineOrderService.getOfflineOrder(orders.wkordrno).then(function (result) {
                    var savePllr = {
                        rwlb: rwlb,
                        bljm: pageOrderInfo
                    };
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        passLocalPllr = orderInfo || [];
                        var existIndex = null;
                        var existFlag = passLocalPllr.some(function (item, index) {
                            existIndex = index;
                            return item.rwlb.premno === orders.premno
                        });
                        existFlag ? passLocalPllr.splice(existIndex, 1, savePllr) : passLocalPllr.push(savePllr);
                        OrderCommonService.saveOrderAndParam(passLocalPllr, orders, param, photoKey);
                    } else {
                        // 第一次保存本地，任务顺序可能发生变化
                        offlineTaskList.unshift(savePllr);
                        OrderCommonService.saveOrderAndParam(offlineTaskList, orders, param, photoKey);
                    }
                })
            }
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
            if (fromPage === 'pllr') {
                if ((!$scope.orderType && !saveFlag) || (network && !saveFlag)) {
                    hyMui.alert("請先實時保存信息");
                    return;
                }
                hyMui.confirm({
                    title: '确认',
                    message: '是否完成批量裝拆信息錄入，若完成請傳遞工單',
                    buttonLabels: ['取消', '傳遞'],
                    callback: function (i) {
                        if (i === 1) {
                            sendCommon();
                        }
                    }
                });
                return;
            }
            if (fromPage === 'lsjd' || fromPage === 'gzcl') {
                // 从临时检定跳转过来，则传递按钮不可用
                return;
            }
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
                        if (fromPage === 'pllr') {
                            var pagelen = mainNavi.pages.length;
                            for (var i = 0; i <= 1; i++) {
                                mainNavi.removePage(pagelen - 2);
                            }
                        } else {
                            mainNavi.popPage();
                        }
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
            // 装拆原因
            systemDropList.getDropInfoList('IRRSNCD').then(function (list) {
                $scope.zcyyDrop = list || [];
            });
            // 装拆标志
            systemDropList.getDropInfoList('IRFLGCD').then(function (list) {
                $scope.zcbzDrop = list || [];
            });
            // 断路器类型
            systemDropList.getDropInfoList('EQUITYPCD').then(function (list) {
                $scope.sblxDrop = list || [];
            });
            // 断路器电流
            // systemDropList.getDropInfoList('MCBMAXCUR').then(function (list) {
            //     $scope.dlqdlDrop = list || [];
            // });
            // 断路器安装位置
            systemDropList.getDropInfoList('MCBINSTLOCCD').then(function (list) {
                $scope.azwzDrop = list || [];
            });
            // 加封對象
            systemDropList.getDropInfoList('SEALEQUICATECD').then(function (list) {
                $scope.jfsbDrop = list || [];
            });
            // 未裝拆原因
            systemDropList.getDropInfoList('NONIRRSNCD').then(function (list) {
                $scope.wzcyyDrop = list || [];
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
         * 扫一扫資產編號
         */
        $scope.scanMeter = function (item) {
            NativeService.scan().then(function (data) {
                if (item.begin) {
                    item.begin.asseno = data;
                } else if (item.end) {
                    item.end.asseno = data;
                    $scope.queryRead(item.end);
                } else {
                    item.asseno = data;
                    $scope.queryRead(item);
                }
            });
        };

        /**
         * 扫一扫出厂编号
         */
        $scope.scanCcbh = function (item) {
            NativeService.scan().then(function (data) {
                if (item.begin) {
                    item.begin.ccbh = data;
                } else if (item.end) {
                    item.end.ccbh = data;
                } else {
                    item.ccbh = data;
                }
            });
        };

        /**
         * 扫一扫电表号码
         */
        $scope.toQueryInfo = function (num) {
            if (num === 1) {
                mainNavi.pushPage('pages/cem/zhfcqx/cem_hyzhcx.html', {
                    cancelIfRunning: true
                })
            } else if (num === 2) {
                mainNavi.pushPage('pages/cem/zhfcqx/cem_fcxxcx.html', {
                    cancelIfRunning: true
                })
            }
        };

        /**
         * 安装位置选择
         * @constructor
         */
        $scope.toQueryAzwzInfo = function (index, mark) {
            order = index;
            sbFlag = mark;
            mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_cxazwz.html', {
                cancelIfRunning: true,
                gzdbh: $scope.zcInfo.wkordrno,
                premno: $scope.zcInfo.premno,// 房产编号
                addrobjno: $scope.zcInfo.addrobjno, // 地址对象编号（用于添加保存）
                offlineAzwz: $scope.anwzData // 离线安装位置
            })
        };

        /**
         * 接收選擇的安裝位置
         */
        $scope.$on('AZWZXZ_CGXX', function (ev, value) {
            if (sbFlag === 'hgq') {
                receiveAzwzbh($scope.hgqList[order], value, sbFlag);
            } else {
                receiveAzwzbh($scope.dnbList[order], value, sbFlag);
            }
        });

        /**
         * 安装位置编号赋值：如果计量点编号相同，则统一赋值；不相同则单独赋值
         * @param selectItem 当前点击的设备对象
         * @param azwzbh 安装位置编号
         */
        function receiveAzwzbh(selectItem, azwzbh, flag) {
            if (selectItem.end) {
                if (flag === 'dnb') {
                    $scope.dnbList[order].end.equilocno = azwzbh;
                } else if (flag === 'hgq') {
                    $scope.hgqList[order].end.equilocno = azwzbh;
                }

                $scope.dnbList.forEach(function (item) {
                    if (item.end && selectItem.metepntno === item.end.metepntno) {
                        item.end.equilocno = azwzbh;
                    }
                });
                $scope.hgqList.forEach(function (item) {
                    if (item.end && selectItem.metepntno === item.end.metepntno) {
                        item.end.equilocno = azwzbh;
                    }
                })
            } else {
                if (flag === 'dnb') {
                    $scope.dnbList[order].equilocno = azwzbh;
                } else if (flag === 'hgq') {
                    $scope.hgqList[order].equilocno = azwzbh;
                }

                $scope.dnbList.forEach(function (item) {
                    if (selectItem.metepntno === item.metepntno) {
                        item.equilocno = azwzbh;
                    }
                });
                $scope.hgqList.forEach(function (item) {
                    if (selectItem.metepntno === item.metepntno) {
                        item.equilocno = azwzbh;
                    }
                })
            }
        }

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

        /**
         * 估读
         */
        $scope.estimate = function (ds) {
            var gd = ds.expcread === 0 ? '0' : ds.expcread;
            if (!gd) {
                hyMui.alert('暫無估讀值');
                return;
            }
            ds.currread = gd;// 估读
        };

        /**
         * 示數超出上下限提醒
         * @param ds
         */
        $scope.stintReminder = function (ds) {
            if (ds.currread && !ToolService.inputNumberStr(ds.currread)) {
                hyMui.alert('請輸入正確讀數');
                ds.currread = '';
                return;
            }
            var maxReadStr = ds.maxread === 0 ? '0' : ds.maxread;
            var minReadStr = ds.minread === 0 ? '0' : ds.minread;
            if ((ds.currread && maxReadStr && maxReadStr != '0' && ds.currread > ds.maxread) || (ds.currread && minReadStr && minReadStr != '0' && ds.currread < ds.minread)) {
                hyMui.alert('您輸入的示數超出上下限');
            }
        };

        /**
         * 只能录入数字
         * @param ds
         */
        $scope.testNumber = function (ds) {
            if (ds.currread && !ToolService.inputNumberStr(ds.currread)) {
                ds.currread = '';
                hyMui.alert('請輸入正確讀數');
            }
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

        /**
         * 預約電話格式校驗
         */
        function isPhone(phoneNum) {
            var phoneReg = /^[0-9]*$/;
            return phoneReg.test(phoneNum);
        }

        $scope.check = function () {
            if ($scope.zcInfo.wkordrtele) {
                if (isPhone($scope.zcInfo.wkordrtele) === false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                }
            }

        };

        /**
         * 检查预约信息
         * @returns {*[]}
         */
        function checkYyxx() {
            var param = null;
            //预约信息允许为空
            if ($scope.zcInfo.apptbegtm && $scope.zcInfo.apptendtm && $scope.zcInfo.ctctpers && $scope.zcInfo.wkordrtele) {
                if (!isPhone($scope.zcInfo.wkordrtele)) {
                    hyMui.alert("請輸入數字類型的預約電話");
                    return [];
                }
                param = [{
                    "apptbegtm": $scope.zcInfo.apptbegtm,
                    "apptendtm": $scope.zcInfo.apptendtm,
                    "apptrec": '',//预约内容记录
                    "cntracctno": $filter('lengthenNumber')(12, $scope.zcInfo.contractno),
                    "ctctpers": $scope.zcInfo.ctctpers,
                    "oprtr": rybs,
                    "sevapptid": $scope.zcInfo.sevapptid,
                    "sevappttyp": '03',//  服务预约类型
                    "wkordrno": $scope.zcInfo.wkordrno,
                    "wkordrtele": $scope.zcInfo.wkordrtele
                }];
            }
            return param;
        }

        /**
         * 跳转持有设备
         */
        $scope.holdingEquipment = function () {
            mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_cysb.html', {
                cancelIfRunning: true
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


        /**************************************************批量装拆离线操作******************************************************/

        function commonPllr(data, order, taskList) {
            var zcgdOrder = {
                zcInfo: {},
                dnbList: [],
                dsList: [],
                hgqList: [],
                dlqList: [],
                xzsRList: [],
                ccsRList: [],
                xzsList: [],
                ccsList: [],
                order: order
            };
            var zcxxInfo = data;
            zcxxInfo.infoVo.meterno = $filter('shortenNumber')(zcxxInfo.infoVo.meterno);// 去零
            zcxxInfo.infoVo.contractno = $filter('shortenNumber')(zcxxInfo.infoVo.contractno);// 去零
            zcgdOrder.zcInfo = zcxxInfo.infoVo;// 基本信息
            zcgdOrder.dsList = translationDsDrop(zcxxInfo.readList);// 电能表读数信息
            zcgdOrder.dlqList = getOfflineDlq(zcxxInfo.mcbList);// 断路器信息
            var param = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                }, "vo": {
                    "datacrer": order.wkordrno // 工单号
                }
            };
            azwzxxService.queryAzwzInfo(param).then(function (data) {
                if (data.length > 0) {
                    zcgdOrder.anwzData = data;
                }
                zhOfflineDnb(zcxxInfo.mtrList, zcgdOrder, taskList);// 电能表数据
                zhOfflineHgq(zcxxInfo.induList, zcgdOrder, taskList);// 互感器数据
            }, function () {
                zhOfflineDnb(zcxxInfo.mtrList, zcgdOrder, taskList);// 电能表数据
                zhOfflineHgq(zcxxInfo.induList, zcgdOrder, taskList);// 互感器数据
            });
            zhOfflineLockInfo(zcxxInfo.sealList, zcgdOrder);// 锁信息
            findTaskToChange(zcgdOrder, taskList);
        }

        /**
         * 组合后的数据替换原始数据
         * @param task 组合后的数据
         * @param taskList 原始组装的批量装拆任务
         */
        function findTaskToChange(task, taskList) {
            for (var i = 0; i < taskList.length; i++) {
                if (task.zcInfo.premno === taskList[i].rwlb.premno) {
                    taskList[i].bljm = task;
                    taskList[i].bljm.premno = task.zcInfo.premno; // 增加房产编号
                    break;
                }
            }
        }

        /**
         * 斷路器篩選：00（原始）的不展示
         * @param sysList
         * @returns {*}
         */
        function getOfflineDlq(sysList) {
            for (var i = 0; i < sysList.length; i++) {
                if (!sysList[i].mcbnbr) {
                    sysList[i].mcbnbr = '1';
                }
            }
            return sysList.filter(function (item) {
                if (item.chgflg !== '00' && item.chgflg !== '20') return item;
            });
        }

        /**
         * 组合电能表数据
         * @param sysList
         * @param zcgdOrder 用于保存而构造的对象
         * @param plTask 批量装拆信息录入任务列表
         */
        function zhOfflineDnb(sysList, zcgdOrder, plTask) {
            var ass = 0;// 计算调用 queryFactoryInf 接口的次数
            for (var i = 0; i < sysList.length; i++) {
                if (sysList[i].asseno) {
                    ass++;
                }
            }
            var doFactorySave = {
                successNum: 0,// 成功调用接口次数
                failNum: 0,// 失败调用接口次数
                sysLen: sysList.length + ass// 一共调用接口次数
            };
            // 向电能表对象中添加錶码数组
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].asseno = $filter('shortenNumber')(sysList[i].asseno);// 去零
                // 以下两步操作保存是保存时需要用到的字段
                sysList[i].oprtr = rybs;
                sysList[i].wkordrno = zcgdOrder.order.wkordrno;
                sysList[i].fldtskid = zcgdOrder.zcInfo.fldtskid;
                sysList[i].ccbh = $filter('shortenNumber')(sysList[i].mnufctno);// 出厂编号（初始化可能会查询出来）去零
                var bmList = [];
                for (var j = 0; j < zcgdOrder.dsList.length; j++) {
                    if (sysList[i].asseno === zcgdOrder.dsList[j].asseno) {
                        zcgdOrder.dsList[j].equiclas = sysList[i].equiclas;// 设备类别
                        zcgdOrder.dsList[j].instmtrid = sysList[i].instdeviid;// 運行電能表標識
                        zcgdOrder.dsList[j].meteequiuniqid = '';// 未知但是没有用到，默认为空
                        bmList.push(zcgdOrder.dsList[j])
                    }
                }
                sysList[i].bm = bmList;
                if (sysList[i].asseno) {
                    queryOfflineFactoryInf(sysList[i], null, doFactorySave, sysList, zcgdOrder, 'dnb', plTask);// 查詢厂家信息
                }
                // 增加设备参数
                getOfflineEquipmentParameter(sysList[i], doFactorySave, sysList, zcgdOrder, 'dnb', plTask);
            }
        }

        /**
         * 组合互感器数据
         * @param sysList
         * @param zcgdOrder 用于保存而构造的对象
         * @param plTask 批量装拆任务列表
         */
        function zhOfflineHgq(sysList, zcgdOrder, plTask) {
            var doSave = {
                successNum: 0,
                failNum: 0,
                sysLen: sysList.length
            };
            // 翻译设备类型
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].asseno = $filter('shortenNumber')(sysList[i].asseno);// 去零
                // 以下两步操作保存是保存时需要用到的字段
                sysList[i].oprtr = rybs;
                sysList[i].wkordrno = zcgdOrder.order.wkordrno;
                sysList[i].fldtskid = zcgdOrder.zcInfo.fldtskid;
                // 增加设备参数
                getOfflineEquipmentParameter(sysList[i], doSave, sysList, zcgdOrder, 'hgq', plTask);
            }
        }

        /**
         * 组合锁信息
         * @param sysList
         * @param zcgdOrder 用于保存而构造的对象
         */
        function zhOfflineLockInfo(sysList, zcgdOrder) {
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].sealno = $filter('shortenNumber')(sysList[i].sealno);// 去零
                if (sysList[i].sealasseno) {
                    sysList[i].sealasseno = $filter('shortenNumber')(sysList[i].sealasseno);// 去零
                }
                if ('10' === sysList[i].chgflg) { //目前按照10 新装  15 拆除的逻辑
                    zcgdOrder.xzsRList.push(sysList[i]);
                } else if ('15' === sysList[i].chgflg) {//拆除
                    zcgdOrder.ccsRList.push(sysList[i]);
                }
            }
        }

        /**
         * 查询电能表厂家信息
         * @param item
         * @param callback
         * @param doSave 用于判断接口执行次数
         * @param sysList 电能表/互感器List
         * @param zcgdOrder 用于保存的组装对象
         * @param fromFlag 来源：电能表/互感器
         * @param plTask 批量装拆任务列表
         */
        function queryOfflineFactoryInf(item, callback, doSave, sysList, zcgdOrder, fromFlag, plTask) {
            if (!item.asseno) return;
            var param = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "vo": {
                    "asseno": $filter('lengthenNumber')(18, item.asseno),
                    "equiclas": item.equiclas,
                    "equityp": item.equityp
                }
            };
            zcgdblsService.queryEquipmentMaster(param).then(function (data) {
                doSave.successNum++;
                item.mnufctno = data.mnufctno; // 出厂编号
                item.manu = data.manu;// 厂家信息
                callback && callback(item);
                var doSaveFlag = true;
                // 组装电能表并保存
                if (doSave.successNum + doSave.failNum === doSave.sysLen) {
                    if (fromFlag === 'dnb') {
                        // 执行组装电能表方法
                        zcgdOrder.dnbList = combinationSbxxNew(sysList);// 电能表信息
                        var oldNum = 0;
                        for (var i = 0; i < zcgdOrder.dnbList.length; i++) {
                            var itemsew = zcgdOrder.dnbList[i].end || zcgdOrder.dnbList[i];
                            var readBegins = zcgdOrder.dnbList[i].begin;//变更前的示数也要显示出来
                            if (itemsew && itemsew.asseno && (!itemsew.bm || itemsew.bm.length === 0)) {
                                oldNum++;
                            }
                            if (readBegins && readBegins.asseno && (!itemsew.bm || itemsew.bm.length === 0)) {
                                oldNum++;
                            }
                        }
                        doSave.sysLen += oldNum;
                        for (var i = 0; i < zcgdOrder.dnbList.length; i++) {
                            var itemse = zcgdOrder.dnbList[i].end || zcgdOrder.dnbList[i];
                            var readBegin = zcgdOrder.dnbList[i].begin;//变更前的示数也要显示出来
                            if (itemse && itemse.asseno && (!itemse.bm || itemse.bm.length === 0)) {
                                doSaveFlag = false;
                                queryOfflineRead(itemse, doSave, sysList, zcgdOrder, 'dnb', plTask);
                            }
                            if (readBegin && readBegin.asseno && (!itemse.bm || itemse.bm.length === 0)) {
                                doSaveFlag = false;
                                queryOfflineRead(readBegin, doSave, sysList, zcgdOrder, 'dnb', plTask);
                            }
                        }
                    } else if (fromFlag === 'hgq') {
                        // 执行组装电能表方法
                        zcgdOrder.hgqList = combinationSbxxNew(sysList);// 互感器信息
                    }
                    findTaskToChange(zcgdOrder, plTask);// 替换作用
                }
            }, function () {
                doSave.failNum++;
            });
        }

        /**
         * 增加设备参数
         * @param item
         * @param doSave 用于判断接口执行次数
         * @param sysList 电能表/互感器List
         * @param zcgdOrder 用于保存的组装对象
         * @param fromFlag 来源：电能表/互感器
         */
        function getOfflineEquipmentParameter(item, doSave, sysList, zcgdOrder, fromFlag, plTask) {
            var param = {
                "equiptypVo": {
                    "equiclas": item.equiclas,
                    "equityp": item.equityp
                }
            };
            zcgdblsService.queryEquipmentParameter(param).then(function (data) {
                doSave.successNum++;
                // 给此item增加设备参数字段
                item.curtranrati = data.curtranrati || '';
                item.nomcur = data.nomcur || '';
                item.nomvolt = data.nomvolt || '';
                item.volttranrati = data.volttranrati || '';
                item.phasln = data.phasln || '';
                item.mtrtyp = data.mtrtyp || '';
                item.mtrmult = data.mtrmult || '';
                switch (item.mtrtyp) {
                    case '01':
                        item.mtrtypMc = '感應式';
                        break;
                    case '02':
                        item.mtrtypMc = '電子式';
                        break;
                    case '03':
                        item.mtrtypMc = 'AMI';
                        break;
                    default:
                        item.mtrtypMc = item.mtrtyp;
                        break;
                }
                // 组装电能表并保存
                var doSaveFlag = true;
                if (doSave.successNum + doSave.failNum === doSave.sysLen) {
                    if (fromFlag === 'dnb') {
                        // 执行组装电能表方法
                        zcgdOrder.dnbList = combinationSbxxNew(sysList);// 电能表信息
                        var oldNum = 0;
                        for (var i = 0; i < zcgdOrder.dnbList.length; i++) {
                            var itemsew = zcgdOrder.dnbList[i].end || zcgdOrder.dnbList[i];
                            var readBegins = zcgdOrder.dnbList[i].begin;//变更前的示数也要显示出来
                            if (itemsew && itemsew.asseno && (!itemsew.bm || itemsew.bm.length === 0)) {
                                oldNum++;
                            }
                            if (readBegins && readBegins.asseno && (!itemsew.bm || itemsew.bm.length === 0)) {
                                oldNum++;
                            }
                        }
                        doSave.sysLen += oldNum;
                        for (var i = 0; i < zcgdOrder.dnbList.length; i++) {
                            var itemse = zcgdOrder.dnbList[i].end || zcgdOrder.dnbList[i];
                            var readBegin = zcgdOrder.dnbList[i].begin;//变更前的示数也要显示出来
                            if (itemse && itemse.asseno && (!itemse.bm || itemse.bm.length === 0)) {
                                doSaveFlag = false;
                                queryOfflineRead(itemse, doSave, sysList, zcgdOrder, 'dnb', plTask);
                            }
                            if (readBegin && readBegin.asseno && (!itemse.bm || itemse.bm.length === 0)) {
                                doSaveFlag = false;
                                queryOfflineRead(readBegin, doSave, sysList, zcgdOrder, 'dnb', plTask);
                            }
                        }
                    } else if (fromFlag === 'hgq') {
                        // 执行组装互感器方法
                        zcgdOrder.hgqList = combinationSbxxNew(sysList);// 电能表信息
                    }
                    findTaskToChange(zcgdOrder, plTask);// 替换作用
                }
            }, function () {
                doSave.failNum++;
            });
        }

        /**
         * 查询电能表示数
         * @param itemObj
         */
        function queryOfflineRead(itemObj, doSave, sysList, zcgdOrder, fromFlag, plTask) {
            if (!itemObj.asseno) {
                itemObj.irflg = '00';//若资产编号为空，则装拆标志为未装拆
                return;
            }
            itemObj.irflg = '01';//若资产编号不为空，则装拆标志为已装拆
            itemObj.nonirrsn = '';//未裝拆原因清空
            itemObj.nonirrsnintroduct = '';//未裝拆說明清空
            var param = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "vo": {
                    "asseno": $filter('lengthenNumber')(18, itemObj.asseno) || "",
                    "cntracctno": $filter('lengthenNumber')(12, zcgdOrder.zcInfo.contractno),
                    "equiclas": itemObj.equiclas || "",
                    "instmtrid": "",
                    "metepntno": itemObj.metepntno || "",
                    "wkordrno": zcgdOrder.zcInfo.wkordrno || ""
                }
            };
            zcgdblsService.queryNewOrUpdateReadList(param).then(function (data) {
                doSave.successNum++;
                if (data.readingList.length > 0) {
                    // 有示数类型，则添加到此item中
                    var newReadList = [];
                    var obj = null;
                    data.readingList.forEach(function (item) {
                        obj = {
                            readtyp: item.readtyp,
                            // readtypMc: item.readtypMc,
                            currread: item.currread,
                            asseno: $filter('shortenNumber')(itemObj.asseno),
                            equiclas: itemObj.equiclas,// 设备类别
                            instmtrid: itemObj.instdeviid,// 運行電能表標識
                            meteequiuniqid: '',// 未知但是没有用到，默认为空
                            mastandslavflg: itemObj.mastandslavflg,// 判断读数是否赋初始值
                            needflg: item.needflg // needflg>0 增加必填标志
                        };
                        if ((obj.mastandslavflg != 1 || obj.needflg <= 0) && !obj.currread) {
                            obj.currread = '0';
                        }
                        newReadList.push(obj);
                        itemObj.bm = newReadList;
                    });
                    if (doSave.successNum + doSave.failNum === doSave.sysLen) {
                        if (fromFlag === 'dnb') {
                            // 执行组装电能表方法
                            zcgdOrder.dnbList = combinationSbxxNew(sysList);// 电能表信息
                        }
                        findTaskToChange(zcgdOrder, plTask);// 替换作用
                    }
                } else {
                    itemObj.bm = [];
                    if (doSave.successNum + doSave.failNum === doSave.sysLen) {
                        if (fromFlag === 'dnb') {
                            // 执行组装电能表方法
                            zcgdOrder.dnbList = combinationSbxxNew(sysList);// 电能表信息
                        }
                        findTaskToChange(zcgdOrder, plTask);// 替换作用
                    }
                }
            }, function () {
                doSave.failNum++;
            });
        }

    }]);