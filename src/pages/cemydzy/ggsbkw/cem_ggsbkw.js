/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/12/30
 * 更改設備庫位
 */
app.controller("cemggsbkwCtrl", ['$scope', 'ggsbkwService', 'NativeService', 'systemDropList', '$filter', '$appConfig', 'PassOrderService', 'OfflineParamService', 'OrderCommonService', 'OfflineOrderService',
    '$rootScope', 'TaskService',
    function ($scope, ggsbkwService, NativeService, systemDropList, $filter, $appConfig, PassOrderService, OfflineParamService, OrderCommonService, OfflineOrderService,
              $rootScope, TaskService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var ycCkValue = '';// 记录选中的移出仓库
        var yrCkValue = '';// 记录选中的移入仓库
        var delSysYrsbList = [];// 删除系统设备数组
        var saveOrderFlag = false;
        $scope.orderType = order.orderType;
        $scope.ckxx = {};// 倉庫信息
        $scope.ycckDrop = [];// 移出仓库
        // $scope.yckqDrop = [];// 移出库区
        // $scope.ychjDrop = [];// 移出货架
        // $scope.yctpDrop = [];// 移出托盘

        $scope.yrckDrop = [];// 移入仓库
        $scope.yrkqDrop = [];// 移入库区
        $scope.yrhjDrop = [];// 移入货架
        $scope.yrtpDrop = [];// 移入托盘

        $scope.yrsbList = [];// 移入設備
        $scope.yrsbSysList = [];// 系統移入設備

        systemDropList.getDropInfoList('EQUICLASCD').then(function (list) {
            $scope.sblbDrop = list || [];
        });
        systemDropList.getDropInfoList('EQUITYPCD').then(function (list) {
            $scope.sblxDrop = list || [];
        });
        // 仓库编号
        systemDropList.getDropInfoList('WARENMCD').then(function (list) {
            $scope.ckDrop = list || [];
            for (var i = 0; i < $scope.ckDrop.length; i++) {
                $scope.ckDrop[i].DMBMMC = $scope.ckDrop[i].DMBM + "-" + $scope.ckDrop[i].DMBMMC;
            }
        });
        // 库区编号/托盘货架
        systemDropList.getDropInfoList('WHLCTCD').then(function (list) {
            $scope.kqHjTpDrop = list || [];
            for (var i = 0; i < $scope.kqHjTpDrop.length; i++) {
                $scope.kqHjTpDrop[i].DMBMMC = $scope.kqHjTpDrop[i].DMBM + "-" + $scope.kqHjTpDrop[i].DMBMMC;
            }
        });

        function init(callback) {
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno).then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.yrsbList = orderInfo.yrsbList || [];
                        $scope.yrsbSysList = orderInfo.yrsbSysList || [];
                        for (var i = 0; i < $scope.yrsbSysList.length; i++) {
                            $scope.yrsbSysList[i].asseno = $filter('shortenNumber')($scope.yrsbSysList[i].asseno);// 去零
                            (function (i) {
                                systemDropList.getDropLable('EQUICLASCD', $scope.yrsbSysList[i].equiclas).then(function (label) {
                                    $scope.yrsbSysList[i].sblbMc = label || $scope.yrsbSysList[i].equiclas;
                                });
                                systemDropList.getDropLable('EQUITYPCD', $scope.yrsbSysList[i].equityp).then(function (label) {
                                    $scope.yrsbSysList[i].sblxMc = label || $scope.yrsbSysList[i].equityp;
                                });
                                if ($scope.yrsbSysList[i].whlctno) {
                                    systemDropList.getDropLable('WHLCTCD', $scope.yrsbSysList[i].whlctno).then(function (label) {
                                        $scope.yrsbSysList[i].ycckMc = label || $scope.yrsbSysList[i].whlctno;
                                    });
                                } else if ($scope.yrsbSysList[i].wareno) {
                                    systemDropList.getDropLable('WARENMCD', $scope.yrsbSysList[i].wareno).then(function (label) {
                                        $scope.yrsbSysList[i].ycckMc = label || $scope.yrsbSysList[i].wareno;
                                    });
                                }
                            })(i);
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
                        getGgsbkwOfflineOrder('local');
                    } else {
                        var param = {
                            "appPackeqinVO": {
                                "asseno": "",
                                "equiclas": "",// 38
                                "equityp": "",// 390001
                                "matecd": "",
                                "wareno": "",
                                "whlctno": "",
                                "wkordrno": order.wkordrno
                            },
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 100
                            }
                        };
                        hyMui.loaderShow();
                        ggsbkwService.queryPackEquipList(param).then(function (res) {
                            hyMui.loaderHide();
                            console.log(res);
                            $scope.yrsbList = [];// 清空移入設備
                            $scope.yrsbSysList = res.sbList || [];
                            for (var i = 0; i < $scope.yrsbSysList.length; i++) {
                                $scope.yrsbSysList[i].asseno = $filter('shortenNumber')($scope.yrsbSysList[i].asseno);// 去零
                                (function (i) {
                                    systemDropList.getDropLable('EQUICLASCD', $scope.yrsbSysList[i].equiclas).then(function (label) {
                                        $scope.yrsbSysList[i].sblbMc = label || $scope.yrsbSysList[i].equiclas;
                                    });
                                    systemDropList.getDropLable('EQUITYPCD', $scope.yrsbSysList[i].equityp).then(function (label) {
                                        $scope.yrsbSysList[i].sblxMc = label || $scope.yrsbSysList[i].equityp;
                                    });
                                    initTranslate($scope.yrsbSysList[i]);
                                })(i);
                            }
                            // 保存传递工单数据至本地
                            callback && callback();
                        }, function () {
                            getGgsbkwOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }

        }

        init();

        function getGgsbkwOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno).then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    // 保存过的初始化，直接复制$scope对象
                    $scope.ckxx = orderInfo.ckxx || {};
                    $scope.yrsbList = orderInfo.yrsbList || [];
                    $scope.yrsbSysList = orderInfo.yrsbSysList || [];
                    for (var i = 0; i < $scope.yrsbSysList.length; i++) {
                        $scope.yrsbSysList[i].asseno = $filter('shortenNumber')($scope.yrsbSysList[i].asseno);// 去零
                        (function (i) {
                            systemDropList.getDropLable('EQUICLASCD', $scope.yrsbSysList[i].equiclas).then(function (label) {
                                $scope.yrsbSysList[i].sblbMc = label || $scope.yrsbSysList[i].equiclas;
                            });
                            systemDropList.getDropLable('EQUITYPCD', $scope.yrsbSysList[i].equityp).then(function (label) {
                                $scope.yrsbSysList[i].sblxMc = label || $scope.yrsbSysList[i].equityp;
                            });
                            initTranslate($scope.yrsbSysList[i]);
                        })(i);
                    }
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        function initTranslate(equ) {
            systemDropList.getDropLable('EQUICLASCD', equ.equiclas).then(function (label) {
                equ.sblbMc = label || equ.equiclas;
            });
            systemDropList.getDropLable('EQUITYPCD', equ.equityp).then(function (label) {
                equ.sblxMc = label || equ.equityp;
            });
            if (equ.whlctnoyc) {
                systemDropList.getDropLable('WHLCTCD', equ.whlctnoyc).then(function (label) {
                    equ.ycckMc = label || equ.whlctnoyc;
                });
            } else if (equ.warenoyc) {
                systemDropList.getDropLable('WARENMCD', equ.warenoyc).then(function (label) {
                    equ.ycckMc = label || equ.warenoyc;
                });
            }
        }

        /**
         * 校验移出设备所在仓库信息
         * @param flag 设备标志
         * @param item 设备
         */
        $scope.checkRkxx = function (flag, item) {
            switch (flag) {
                case 'zcbh':
                    // 校验该资产编号是否存在库位信息，若不存在仓位信息，则提示出来
                    checkZcbhAndWlbh(item, flag);
                    break;
                case 'wlbh':
                    // 校验断路器、断路器盒、DCU设备，查询对应的库位信息
                    checkZcbhAndWlbh(item, flag);
                    break;
                case 'quantity':
                    // 校验断路器、断路器盒、DCU设备数量
                    checkQuantity(item);
                    break;
            }
        };

        /**
         * 查询移入设备的仓库信息
         * @param equipment
         * @param flag
         */
        var blurFlag = true;//控制点击保存按钮时，只执行失去焦点的方法，先不执行保存方法
        var saveFlag = true;//控制点击保存按钮时，如果通过了校验，要继续执行保存方法
        function checkZcbhAndWlbh(equipment, flag) {
            if (flag === 'zcbh' && !equipment.asseno) {
                // hyMui.alert('請輸入資產編號');
                return;
            }
            if (equipment.asseno) {
                // 校驗是否存在重複資產編號
                var checkEqu = $scope.yrsbList.concat($scope.yrsbSysList);
                var num = 0;
                for (var i = 0; i < checkEqu.length; i++) {
                    if (checkEqu[i].asseno === equipment.asseno) {
                        num++;
                    }
                }
                if (num > 1) {
                    hyMui.alert('該資產編號已存在', function () {
                        equipment.asseno = '';
                        $scope.$evalAsync();
                    });
                    return;
                }
            }
            // 替换仓库、设备（为了防止用户修改）
            equipment.equiclas = $scope.ckxx.sblb;
            equipment.equityp = $scope.ckxx.sblx;
            // equipment.warenomo = $scope.ckxx.ycck;
            // equipment.whlctnomo = $scope.ckxx.yctp || $scope.ckxx.ychj || $scope.ckxx.yckq;
            equipment.warenomi = $scope.ckxx.yrck;
            equipment.whlctnomi = $scope.ckxx.yrtp || $scope.ckxx.yrhj || $scope.ckxx.yrkq;
            if (flag === 'wlbh' && !equipment.matecd) {
                // hyMui.alert('請輸入物料編號');
                return;
            }
            if (equipment.matecd) {
                var wlbhNum = 0;
                for (var i = 0; i < $scope.yrsbList.length; i++) {
                    if ($scope.yrsbList[i].matecd === equipment.matecd) {
                        wlbhNum++;
                    }
                }
                if (wlbhNum > 1) {
                    hyMui.alert('該物料編號已存在', function () {
                        equipment.matecd = '';
                        $scope.$evalAsync();
                    });
                    return;
                }
            }
            if (!navigator.onLine) return;
            blurFlag = false;
            saveFlag = false;
            var param = {
                "appPackeqinVO": {
                    "asseno": $filter('lengthenNumber')(18, equipment.asseno),
                    "equiclas": equipment.equiclas,
                    "equityp": equipment.equityp,
                    "matecd": equipment.matecd,
                    // "wareno": equipment.warenomo,
                    // "whlctno": equipment.whlctnomo,
                    "wareno": '',
                    "whlctno": '',
                    "wkordrno": ''
                },
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                }
            };
            hyMui.loaderShow();
            ggsbkwService.queryPackEquipList(param).then(function (res) {
                hyMui.loaderHide();
                blurFlag = true;
                if (res.sbList.length > 0) {
                    console.log(res);
                    $scope.selectWlItem = {};
                    var sysSb = res.sbList[0];
                    var xxflag = true;
                    // 翻译设备类型
                    systemDropList.getDropLable('EQUITYPCD', sysSb.equityp).then(function (label) {
                        equipment.sblxMc = label || sysSb.equityp;
                        equipment.equityp = sysSb.equityp;
                    });
                    if (flag === 'wlbh') {
                        // 移出仓库字段赋值给添加项
                        var ck = res.sbList || [];
                        if (ck.length === 1) {
                            ycckTranslate(ck[0], equipment);
                            equipment.showMoreCk = false;
                        } else {
                            equipment.ckdm = [];
                            for (var i = 0; i < ck.length; i++) {
                                var ckObj = {
                                    warenomo: ck[i].wareno,
                                    whlctnomo: ck[i].whlctno,
                                    sysStrgnbr: ck[i].strgnbr, // 仓库物料数量
                                    num: i
                                };
                                equipment.ckdm.push(ckObj);
                            }
                            if (equipment.ckdm.length > 1) {
                                equipment.showMoreCk = true;
                            }
                            $scope.selCk = equipment.ckdm;
                            for (var j = 0; j < $scope.selCk.length; j++) {
                                (function (j) {
                                    systemDropList.getDropLable('WARENMCD', $scope.selCk[j].warenomo).then(function (label) {
                                        $scope.selCk[j].warenomc = label || $scope.selCk[j].warenomo || '';
                                        systemDropList.getDropLable('WHLCTCD', $scope.selCk[j].whlctnomo).then(function (label) {
                                            $scope.selCk[j].whlctnomc = label || $scope.selCk[j].whlctnomo || '';
                                            if ($scope.selCk[j].warenomc && $scope.selCk[j].whlctnomc) {
                                                $scope.selCk[j].selckmc = $scope.selCk[j].warenomc + ' - ' + $scope.selCk[j].whlctnomc;
                                            } else {
                                                $scope.selCk[j].selckmc = $scope.selCk[j].warenomc ? $scope.selCk[j].warenomc : $scope.selCk[j].whlctnomc;
                                            }
                                        });
                                    });
                                })(j)
                            }
                            searchDialog.show();
                            $scope.selectWlItem = equipment;
                        }
                        // 记录系统物料数量
                        equipment.sysStrgnbr = sysSb.strgnbr || 0;
                        // 校验数量
                        xxflag = checkQuantity(equipment);
                    } else {
                        // 移出仓库
                        ycckTranslate(sysSb, equipment);
                        // 移出仓库赋值
                        equipment.warenomo = sysSb.wareno;
                        equipment.whlctnomo = sysSb.whlctno;
                    }
                    //如果校验数量通过并且是点了保存按钮，才执行save方法
                    if (xxflag && saveFlag) {
                        $scope.save();
                    }
                } else {
                    // 提示该设备不属于哪个位置
                    var sblx = equipment.sblxMc ? '（' + equipment.sblxMc + '）' : '';
                    var message = '或該設備不是' + equipment.sblbMc + sblx;
                    hyMui.alert('該設備不屬於倉庫' + message, function () {
                        if (flag === 'zcbh') {
                            equipment.asseno = '';
                        } else {
                            equipment.matecd = '';
                        }
                        $scope.$evalAsync();
                    });
                    /*if (equipment.whlctnomo) {
                        systemDropList.getDropLable('WHLCTCD', equipment.whlctnomo).then(function (label) {
                            var ck = label || '倉庫';
                            hyMui.alert('該設備不屬於' + ck + message, function () {
                                if (flag === 'zcbh') {
                                    equipment.asseno = '';
                                } else {
                                    equipment.matecd = '';
                                }
                                $scope.$evalAsync();
                            });
                        });
                    } else {
                        systemDropList.getDropLable('WARENMCD', equipment.warenomo).then(function (label) {
                            var ck = label || '倉庫';
                            hyMui.alert('該設備不屬於' + ck + message, function () {
                                if (flag === 'zcbh') {
                                    equipment.asseno = '';
                                } else {
                                    equipment.matecd = '';
                                }
                                $scope.$evalAsync();
                            });
                        });
                    }*/
                }
            }, function () {
                blurFlag = true;
                hyMui.loaderHide();
            })
        }

        function ycckTranslate(sysSb, oldEqu) {
            if (sysSb.whlctno) {
                systemDropList.getDropLable('WHLCTCD', sysSb.whlctno).then(function (label) {
                    oldEqu.ycckMc = label || sysSb.whlctno;
                });
            } else if (sysSb.wareno) {
                systemDropList.getDropLable('WARENMCD', sysSb.wareno).then(function (label) {
                    oldEqu.ycckMc = label || sysSb.wareno;
                });
            }
            $scope.$evalAsync();
        }

        var searchDialog = null;

        /**
         * 创建颜色选择面板
         */
        var initDialog = function () {
            ons.ready(function () {
                ons.createDialog('pages/cemydzy/ggsbkw/selectWarehouse.html', {parentScope: $scope}).then(function (dialog) {
                    searchDialog = dialog;
                });
            });
        };

        initDialog();
        $scope.sel = {
            val: ''
        };

        $scope.selectCk = function () {
            $scope.selCk.some(function (item) {
                if (item.num == $scope.sel.val) {
                    $scope.selectWlItem.warenomo = item.warenomo;
                    $scope.selectWlItem.whlctnomo = item.whlctnomo;
                    $scope.selectWlItem.sysStrgnbr = item.sysStrgnbr;
                    $scope.selectWlItem.ycckMc = item.whlctnomc || item.warenomc;
                    return true;
                }
            });
            $scope.sel.val = '';
            searchDialog.hide();
            console.log($scope.selectWlItem);
            console.log($scope.sel.val);
        };

        $scope.selectKw = function () {
            if ($scope.selectWlItem && ($scope.selectWlItem.ycckMc || $scope.selectWlItem.showMoreCk)) {
                $scope.selCk = $scope.selectWlItem.ckdm;
                searchDialog.show();
            }
        };

        /**
         * 核对数量
         * @param equipment
         * @returns {boolean}
         */
        function checkQuantity(equipment) {
            var wlSl = equipment.strgnbr || '0';
            var sysWlsl = equipment.sysStrgnbr || '0';
            var numberReg = /^[0-9]*$/;
            var isNumber = numberReg.test(equipment.strgnbr);
            if (!isNumber) {
                hyMui.alert('請錄入數字', function () {
                    equipment.strgnbr = '';
                    $scope.$evalAsync();
                });
                return false;
            }
            if (wlSl !== '0') {
                if (!equipment.matecd) {
                    hyMui.alert('請輸入物料編號');
                    return false;
                }
            }
            if (wlSl && Number(wlSl) > Number(sysWlsl)) {
                hyMui.alert('該物料移入數量大於移出倉庫中的數量，請重新錄入', function () {
                    equipment.strgnbr = '';
                    $scope.$evalAsync();
                });
                return false;
            }
            return true;
        }

        /**
         * 保存
         */
        $scope.save = function () {
            saveFlag = true;
            if (blurFlag == true) {
                for (var i = 0; i < $scope.yrsbList.length; i++) {
                    var flag = equipmentType($scope.yrsbList[i].equiclas);
                    if (flag === 'zcbh') {
                        if (!$scope.yrsbList[i].asseno) {
                            hyMui.alert('資產編號不能為空');
                            return;
                        }
                    } else {
                        if (!$scope.yrsbList[i].matecd) {
                            hyMui.alert('物料編號不能為空');
                            return;
                        }
                    }
                }
                // 保存方法
                $scope.yrsbList.forEach(function (item) {
                    item.wkordrno = order.wkordrno;
                    item.nbr = item.strgnbr || item.sysStrgnbr;// 数量，如果没输入数量，默认传全部的数量
                });
                delSysYrsbList.forEach(function (item) {
                    var type = equipmentType(item.equiclas);
                    item.wkordrno = order.wkordrno;
                    item.operatorid = rybs;
                    item.warenomi = item.wareno;// 移入仓库
                    item.whlctnomi = item.whlctno;// 移入库区
                    item.oprtflag = '3';// 删除
                    if (type === 'zcbh') {
                        item.chgtyp = 'Normal';// 变更类型
                        item.inboandoutbequiid = item.crksbbs;// 出入库设备标识（OPRTFLAG为修改、删除时，必填）
                        item.equipstrgid = item.sbccbs;// 设备存储标识（OPRTFLAG为修改、删除时，必填）
                    } else {
                        item.nbr = item.strgnbr;// 数量
                        item.chgtyp = 'Micro';// 变更类型
                        item.mtrmicrequipindoutid = item.crksbbs;// 小件设备出入库记录标识（OPRTFLAG为修改、删除时，必填）
                        item.mtrmicrequipstrgid = item.sbccbs;// 小件设备存储标识（OPRTFLAG为修改、删除时，必填）
                    }
                });
                var param = delSysYrsbList.concat($scope.yrsbList);
                // 对资产编号补零
                param.forEach(function (item) {
                    if (item.asseno) {
                        item.asseno = $filter('lengthenNumber')(18, item.asseno);
                    }
                });
                if (param.length === 0) {
                    hyMui.alert('請添加或刪除設備');
                    return;
                }
                if (!navigator.onLine) {
                    saveGgsbkwOfflie(param);
                    return;
                }
                hyMui.loaderShow();
                ggsbkwService.savePackEquipList(param).then(function (res) {
                    hyMui.loaderHide();
                    if (res.rslt === '0') {
                        saveOrderFlag = true;
                        order.orderType = '1';// 工单状态，1.已保存 2.已传递
                        order.offLineState = false;// 非离线工单
                        order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                        // 刪除此工单入参本地数据
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        delSysYrsbList = [];// 清空删除系统设备数组
                        hyMui.alert('保存成功');
                        init(passOrderCallBack);
                    } else {
                        hyMui.alert('保存失敗，' + res.rsltinfo);
                    }
                }, function () {
                    saveGgsbkwOfflie(param);
                    hyMui.loaderHide();
                });
            }
        };

        /**
         * 缓存离线工单保存的入参数据
         * @param param
         */
        function saveGgsbkwOfflie(param) {
            var orderInfo = {
                ckxx: $scope.ckxx || {},
                yrsbList: $scope.yrsbList || [],
                yrsbSysList: $scope.yrsbSysList || []
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(orderInfo, order, param, '');
        }

        /**
         * 传递工单本地保存
         */
        function passOrderCallBack() {
            var orderInfo = {
                ckxx: {},
                yrsbList: $scope.yrsbList,
                yrsbSysList: $scope.yrsbSysList
            };
            PassOrderService.savePassOrder(orderInfo, order); // 本地緩存传递工单数据
        }

        /**
         * 传递
         * @returns {boolean}
         */
        $scope.send = function () {
            // 从未办理进入并且未保存过，从本地数据库获取并且未保存过 给予提示
            if ((!$scope.orderType && !saveOrderFlag) || ($scope.netWorkStatus === 'local' && !saveOrderFlag)) {
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
                    hyMui.loaderHide();
                    hyMui.alert("傳遞失敗");
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        /**
         * 级联筛选下拉：库区、货架、托盘
         * @param value
         * @param flag
         */
        $scope.filterDrop = function (value, flag) {
            /*if ($scope.ckxx.ycck !== ycCkValue) {
                $scope.yckqDrop = [];// 移出库区
                $scope.ychjDrop = [];// 移出货架
                $scope.yctpDrop = [];// 移出托盘
            }*/
            if ($scope.ckxx.yrck !== yrCkValue) {
                $scope.yrkqDrop = [];// 移入库区
                $scope.yrhjDrop = [];// 移入货架
                $scope.yrtpDrop = [];// 移入托盘
            }
            switch (flag) {
                /*case 'kq':
                    ycCkValue = $scope.ckxx.ycck;
                    $scope.yckqDrop = [];
                    commonFilter($scope.yckqDrop, value);
                    break;
                case 'hj':
                    $scope.ychjDrop = [];
                    commonFilter($scope.ychjDrop, value);
                    break;
                case 'tp':
                    $scope.yctpDrop = [];
                    commonFilter($scope.yctpDrop, value);
                    break;*/
                case 'yrkq':
                    yrCkValue = $scope.ckxx.yrck;
                    $scope.yrkqDrop = [];
                    commonFilter($scope.yrkqDrop, value);
                    break;
                case 'yrhj':
                    $scope.yrhjDrop = [];
                    commonFilter($scope.yrhjDrop, value);
                    break;
                case 'yrtp':
                    $scope.yrtpDrop = [];
                    commonFilter($scope.yrtpDrop, value);
                    break;
            }
        };

        /**
         * 过滤库区、货架、托盘
         * @param ary
         * @param value
         */
        function commonFilter(ary, value) {
            if ($scope.kqHjTpDrop) {
                $scope.kqHjTpDrop.filter(function (item) {
                    if (item.SJDMBMBS === value) {
                        ary.push(item);
                    }
                });
            }
        }

        /**
         * 添加入庫設備
         */
        $scope.addYrsb = function (callback, scanAsseno) {
            /*if (!$scope.ckxx.ycck || !$scope.ckxx.yrck) {
                hyMui.alert('請選擇移出移入倉庫');
                return;
            }*/
            if (!$scope.ckxx.yrck) {
                hyMui.alert('請選擇移入倉庫');
                return;
            }
            if (!$scope.ckxx.sblb) {
                hyMui.alert('請選擇設備類別');
                return;
            }
            var sblbMc = '';
            var sblxMc = '';
            var type = equipmentType($scope.ckxx.sblb);
            systemDropList.getDropLable('EQUICLASCD', $scope.ckxx.sblb).then(function (label) {
                sblbMc = label || $scope.ckxx.sblb;
                systemDropList.getDropLable('EQUITYPCD', $scope.ckxx.sblx).then(function (label) {
                    sblxMc = label || $scope.ckxx.sblx;
                    var item = {
                        equiclas: $scope.ckxx.sblb,
                        equityp: $scope.ckxx.sblx,
                        operatorid: rybs,
                        sblbMc: sblbMc,
                        sblxMc: sblxMc,
                        // warenomo: $scope.ckxx.ycck,// 移出仓库编号
                        // whlctnomo: $scope.ckxx.yctp || $scope.ckxx.ychj || $scope.ckxx.yckq, // 移出库区/货架/托盘编号
                        warenomi: $scope.ckxx.yrck,// 移入仓库编号
                        whlctnomi: $scope.ckxx.yrtp || $scope.ckxx.yrhj || $scope.ckxx.yrkq,// 移入库区/货架/托盘编号
                        oprtflag: '1' // 1 新增 2 修改 3 删除
                    };
                    if (type === 'zcbh') {
                        item.asseno = '';
                        item.chgtyp = 'Normal';// 变更类型
                    } else {
                        item.matecd = '';// 物料编号
                        item.strgnbr = '';// 数量
                        item.chgtyp = 'Micro';// 变更类型
                    }
                    $scope.yrsbList.unshift(item);
                    // 掃描錄入資產編號
                    callback && callback(scanAsseno);
                });
            });
        };

        /**
         * 刪除移入設備
         * @param index
         */
        $scope.delYrsb = function (index) {
            $scope.yrsbList.splice(index, 1);
        };

        /**
         * 删除系统移入设备
         * @param index
         */
        $scope.delSysYrsb = function (index) {
            delSysYrsbList.push($scope.yrsbSysList[index]);
            $scope.yrsbSysList.splice(index, 1);
        };

        /**
         * 扫一扫电表号码
         */
        $scope.scanMeter = function (item) {
            NativeService.scan().then(function (data) {
                var num = 0;
                $scope.yrsbList.forEach(function (data) {
                    if (data.asseno === '') {
                        num++;
                    }
                });
                if (num === 0) {
                    $scope.addYrsb(inputZcbh, data);
                } else {
                    inputZcbh(data);
                }
            });
        };

        function inputZcbh(zcbh) {
            var assenoCheck = $scope.yrsbList.concat($scope.yrsbSysList);
            for (var j = 0; j < assenoCheck.length; j++) {
                if (assenoCheck[j].asseno === zcbh) {
                    hyMui.toast({message: '資產編號已存在，請重新掃描', duration: 1000}, function () {
                        $scope.scanMeter();// 调用扫码功能
                    });
                    return;
                }
            }
            for (var i = $scope.yrsbList.length - 1; i >= 0; i--) {
                var sbFlag = equipmentType($scope.yrsbList[i].equiclas);
                if (sbFlag === 'zcbh') {
                    // 給資產編號最後一項為空的賦值
                    if (!$scope.yrsbList[i].asseno) {
                        var equipment = $scope.yrsbList[i];
                        // 替换仓库、设备（为了防止用户修改）
                        equipment.equiclas = $scope.ckxx.sblb;
                        equipment.equityp = $scope.ckxx.sblx;
                        // equipment.warenomo = $scope.ckxx.ycck;
                        // equipment.whlctnomo = $scope.ckxx.yctp || $scope.ckxx.ychj || $scope.ckxx.yckq;
                        equipment.warenomi = $scope.ckxx.yrck;
                        equipment.whlctnomi = $scope.ckxx.yrtp || $scope.ckxx.yrhj || $scope.ckxx.yrkq;
                        if (!navigator.onLine) {
                            equipment.asseno = zcbh;
                            hyMui.toast({message: '資產編號添加成功', duration: 1000}, function () {
                                $scope.scanMeter();// 调用扫码功能
                            });
                            return;
                        }
                        var param = {
                            "appPackeqinVO": {
                                "asseno": $filter('lengthenNumber')(18, zcbh),
                                "equiclas": equipment.equiclas,
                                "equityp": equipment.equityp,
                                "matecd": equipment.matecd,
                                "wareno": equipment.warenomo,
                                "whlctno": equipment.whlctnomo,
                                "wkordrno": ''
                            },
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 100
                            }
                        };
                        (function (equipment, i) {
                            hyMui.loaderShow();
                            ggsbkwService.queryPackEquipList(param).then(function (res) {
                                hyMui.loaderHide();
                                blurFlag = true;
                                if (res.sbList.length > 0) {
                                    equipment.asseno = zcbh;
                                    var sb = res.sbList[0];
                                    // 翻译设备类型
                                    systemDropList.getDropLable('EQUITYPCD', sb.equityp).then(function (label) {
                                        equipment.sblxMc = label || sb.equityp;
                                        equipment.equityp = sb.equityp;
                                    });
                                    // 移出仓库赋值
                                    ycckTranslate(sb, equipment);
                                    equipment.warenomo = sb.wareno;
                                    equipment.whlctnomo = sb.whlctno;
                                    hyMui.toast({message: '資產編號添加成功', duration: 1000}, function () {
                                        $scope.scanMeter();// 调用扫码功能
                                    });
                                } else {
                                    // 提示该设备不属于哪个位置
                                    hyMui.alert('該設備不屬於' + ck);
                                    $scope.yrsbList.splice(i, 1);
                                    /*if (equipment.whlctnomo) {
                                        systemDropList.getDropLable('WHLCTCD', equipment.whlctnomo).then(function (label) {
                                            var ck = label || '倉庫';
                                            hyMui.alert('該設備不屬於' + ck);
                                            $scope.yrsbList.splice(i, 1);
                                        });
                                    } else {
                                        systemDropList.getDropLable('WARENMCD', equipment.warenomo).then(function (label) {
                                            var ck = label || '倉庫';
                                            hyMui.alert('該設備不屬於' + ck);
                                            $scope.yrsbList.splice(i, 1);
                                        });
                                    }*/
                                }
                            }, function () {
                                hyMui.loaderHide();
                            });
                        })(equipment, i);
                        break;
                    }
                }
            }
        }

        /**
         * 判断移入设备类型：断路器、断路器盒、DCU设备为wlbh 其他为zcbh
         * @param equiclas
         * @returns {string}
         */
        function equipmentType(equiclas) {
            var flag = 'zcbh';
            if (equiclas !== '01' && equiclas !== '02' && equiclas !== '21' && equiclas !== '44') {
                flag = 'wlbh';
            }
            return flag;
        }

        /**
         * 筛选设备类别对应的设备类型
         * @param value
         */
        $scope.filterSblx = function (value) {
            if ($scope.sblxDrop) {
                $scope.sblxFilterDrop = $scope.sblxDrop.filter(function (item) {
                    return item.SJDMBMBS === value;
                })
            }
        };
    }

]);