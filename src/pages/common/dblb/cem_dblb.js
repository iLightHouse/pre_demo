/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/11
 * 待辦列表
 */
app.controller("cemdblbCtrl", ['$scope', '$http', '$filter', '$interval', 'NativeService', 'homeService', 'systemDropList', '$hyUtil', '$appConfig', 'TFConstant', 'TaskService', '$rootScope',
    function ($scope, $http, $filter, $interval, NativeService, homeService, systemDropList, $hyUtil, $appConfig, TFConstant, TaskService, $rootScope) {
        // var menu = mainNavi.getCurrentPage().options.menu;
        var homeData = mainNavi.getCurrentPage().options.homeData || {};
        var menu = homeData.menu;
        var notSaveList = homeData.notSaveOrder;
        var saveList = homeData.saveOrder;
        var passList = homeData.passOrder;
        var copyNotSave = [];
        var copyNotSaveSort = [];
        var copySave = [];
        var copyPass = [];
        var intervalTask = null;
        var orderColorRemark = null; // 工单颜色标注
        var searchDialog = null;// 选择颜色Dialog
        var queryFlag = null;// 查询颜色标志
        $scope.title = menu.menuName;// 標題
        $scope.hjh = menu.hjh;// 环节号
        $scope.SortType = 0;
        $scope.query = {};// 查询条件
        $scope.init = true;
        $scope.sfDrop = [{
            DMBMMC: "是",
            DMBM: "1"
        }, {
            DMBMMC: "否",
            DMBM: "0"
        }];

        systemDropList.getDropInfoList('REGIONCD').then(function (list) {
            $scope.qfDrop = list;
        });

        function init() {
            // 构建查询条件任务类型、业务类别、优先级下拉
            obtainSelect($scope.hjh);
            // 筛选tab工单，并给未办理工单排序
            queryTaskOrder();
            // 存在数据开启定时器，首页加，这里先不加
            /*if ($scope.notSaveList.length > 0 && !intervalTask) {
                intervalTask = intervalList($scope.hjh);
            }*/
        }

        init();

        /**
         * 筛选当前菜单下的工单，并给未办理工单排序
         */
        function queryTaskOrder() {
            var notSaveLists = notSaveList.filter(function (item) {
                return $scope.hjh.indexOf(item.wkflowstdtaskno.toString()) !== -1;
            });
            $scope.saveList = saveList.filter(function (item) {
                return $scope.hjh.indexOf(item.wkflowstdtaskno.toString()) !== -1;
            });
            $scope.passList = passList.filter(function (item) {
                return $scope.hjh.indexOf(item.wkflowstdtaskno.toString()) !== -1;
            });
            copyNotSave = angular.copy(notSaveLists);
            copySave = angular.copy($scope.saveList);
            copyPass = angular.copy($scope.passList);
            $scope.notSaveList = sortOrder(notSaveLists);
            copyNotSaveSort = angular.copy($scope.notSaveList);
            $scope.$evalAsync();
        }

        /**
         * 定义定时器，间隔一定时间刷新未办理下的列表数据，不重新请求接口
         * 复电检查需要三分钟一刷新，并重新请求接口
         * @param taskId
         * @returns {*}
         */
        function intervalList(taskId) {
            if (taskId === 784) {
                // 环节号是6则为复电，默认三分钟
                return $interval(function () {
                    if ($scope.notSaveList.length > 0) {
                        // $scope.initZfjh($scope.SortType, menu.hjh);// 重新请求接口
                        queryTaskOrder();
                    }
                }, 180000);
            } else {
                return $interval(function () {
                    if ($scope.notSaveList.length > 0) {
                        queryTaskOrder();
                        // queryByTab(allList, 0);
                    }
                }, 3000000);
            }
        }

        /**
         * 构建查询条件下的任务类型、业务类别、优先级
         * @param hjh
         */
        function obtainSelect(hjh) {
            if (hjh === '1168;1170;1169;1171') {
                $scope.yxjDrop = [{
                    DMBMMC: "正常",
                    DMBM: "01"
                }, {
                    DMBMMC: "加急",
                    DMBM: "02"
                }, {
                    DMBMMC: "緊急",
                    DMBM: "03"
                }, {
                    DMBMMC: "特別緊急",
                    DMBM: "04"
                }, {
                    DMBMMC: "預約時間",
                    DMBM: "2"
                }, {
                    DMBMMC: "接收時間",
                    DMBM: "3"
                }];
            } else {
                $scope.yxjDrop = [{
                    DMBMMC: "預約時間",
                    DMBM: "2"
                }, {
                    DMBMMC: "接收時間",
                    DMBM: "3"
                }];
            }
            var commonDrop = [{
                DMBMMC: "設備到貨驗收管理",
                DMBM: "CCS-DM-01"
            }, {
                DMBMMC: "電能表檢定",
                DMBM: "CCS-DM-02"
            }, {
                DMBMMC: "低壓電流互感器檢定",
                DMBM: "CCS-DM-03"
            }, {
                DMBMMC: "設備需用（領料出庫）管理",
                DMBM: "CCS-DM-04"
            }, {
                DMBMMC: "設備領用及裝拆",
                DMBM: "CCS-DM-05"
            }, {
                DMBMMC: "現場檢驗（客戶臨時檢驗）",
                DMBM: "CCS-DM-08"
            }, {
                DMBMMC: "計量裝置故障處理",
                DMBM: "CCS-DM-09"
            }, {
                DMBMMC: "電能表運行抽檢",
                DMBM: "CCS-DM-10"
            }, {
                DMBMMC: "電能表輪換",
                DMBM: "CCS-DM-11"
            }, {
                DMBMMC: "已安裝電能表丟失",
                DMBM: "CCS-DM-12"
            }, {
                DMBMMC: "拆回設備再利用",
                DMBM: "CCS-DM-13"
            }, {
                DMBMMC: "設備報廢",
                DMBM: "CCS-DM-14"
            }, {
                DMBMMC: "客戶安全隱患整改",
                DMBM: "CCS-DM-18"
            }];
            switch (hjh) {
                case '1168;1170;1169;1171':
                    $scope.rwlxDrop = [{
                        DMBMMC: "現場檢查",
                        DMBM: "1168"
                    }, {
                        DMBMMC: "複驗",
                        DMBM: "1170"
                    }, {
                        DMBMMC: "工程驗收",
                        DMBM: "1169"
                    }, {
                        DMBMMC: "工程複驗",
                        DMBM: "1171"
                    }];
                    $scope.ywlbDrop = [{
                        DMBMMC: "新裝用電-PNC",
                        DMBM: "CCS-CS-01"
                    }, {
                        DMBMMC: "臨時用電-PCT",
                        DMBM: "CCS-CS-02"
                    }, {
                        DMBMMC: "功率變更-PAC",
                        DMBM: "CCS-CS-03"
                    }, {
                        DMBMMC: "功率變更-PAC（無表）",
                        DMBM: "CCS-CS-04"
                    }, {
                        DMBMMC: "合同終止-PRC",
                        DMBM: "CCS-CS-05"
                    }, {
                        DMBMMC: "設備拆除-PRIE",
                        DMBM: "CCS-CS-11"
                    }, {
                        DMBMMC: "重大變更-Major PAF",
                        DMBM: "CCS-CS-12"
                    }, {
                        DMBMMC: "微小變更-Minor PAF",
                        DMBM: "CCS-CS-13"
                    }, {
                        DMBMMC: "移動-Move Meter Process",
                        DMBM: "CCS-CS-14"
                    }, {
                        DMBMMC: "光伏工程",
                        DMBM: "CCS-CS-30"
                    }];
                    break;
                case '144;1890;1892':
                    $scope.rwlxDrop = [{
                        DMBMMC: "安全隱患檢查",
                        DMBM: "144;1892"
                    }, {
                        DMBMMC: "安全隱患複查",
                        DMBM: "1890"
                    }];
                    $scope.ywlbDrop = commonDrop;
                    break;
                case '118;119;1127':
                    $scope.rwlxDrop = [{
                        DMBMMC: "裝拆辦理",
                        DMBM: "118"
                    }, {
                        DMBMMC: "批量裝拆信息錄入",
                        DMBM: "119"
                    }, {
                        DMBMMC: "批量裝拆鎖錄入",
                        DMBM: "1127"
                    }];
                    $scope.ywlbDrop = commonDrop;
                    $scope.ywlbDrop.push({
                        DMBMMC: "計量裝置開鎖",
                        DMBM: "CCS-DM-27-01"
                    }, {
                        DMBMMC: "計量裝置重鎖",
                        DMBM: "CCS-DM-27-02"
                    });
                    break;
                case '1128':
                    $scope.rwlxDrop = [{
                        DMBMMC: "聯合檢查",
                        DMBM: "1128"
                    }];
                    $scope.ywlbDrop = commonDrop;
                    break;
                case '526':
                    $scope.rwlxDrop = [{
                        DMBMMC: "故障處理",
                        DMBM: "526"
                    }];
                    $scope.ywlbDrop = commonDrop;
                    break;
                case '784':
                    $scope.rwlxDrop = [{
                        DMBMMC: "復電辦理",
                        DMBM: "784"
                    }];
                    $scope.ywlbDrop = [{
                        DMBMMC: "欠費復電",
                        DMBM: "CCS-RP-16"
                    }, {
                        DMBMMC: "未經授權用電復電",
                        DMBM: "CCS-RP-17"
                    }, {
                        DMBMMC: "多月抄不到錶復電",
                        DMBM: "CCS-RP-18"
                    }, {
                        DMBMMC: "非法旅館復電",
                        DMBM: "CCS-RP-19"
                    }, {
                        DMBMMC: "其他情況復電",
                        DMBM: "CCS-RP-20"
                    }];
                    break;
                case '779':
                    $scope.rwlxDrop = [{
                        DMBMMC: "停電辦理",
                        DMBM: "779"
                    }];
                    $scope.ywlbDrop = [{
                        DMBMMC: "欠費停電",
                        DMBM: "CCS-RP-10"
                    }, {
                        DMBMMC: "未經授權用電停電",
                        DMBM: "CCS-RP-11"
                    }, {
                        DMBMMC: "多月抄不到錶停電",
                        DMBM: "CCS-RP-12"
                    }, {
                        DMBMMC: "非法旅館停電",
                        DMBM: "CCS-RP-13"
                    }, {
                        DMBMMC: "其他情況停電",
                        DMBM: "CCS-RP-14"
                    }, {
                        DMBMMC: "私自復電後再停電",
                        DMBM: "CCS-RP-23"
                    }];
                    break;
                case '115':
                    $scope.rwlxDrop = [{
                        DMBMMC: "装拆分派",
                        DMBM: "115"
                    }];
                    $scope.ywlbDrop = commonDrop;
                    break;
                case '98':
                    $scope.rwlxDrop = [{
                        DMBMMC: "臨時檢定",
                        DMBM: "98"
                    }];
                    $scope.ywlbDrop = commonDrop;
                    break;
                case '2100':
                    $scope.rwlxDrop = [{
                        DMBMMC: "移庫",
                        DMBM: "2100"
                    }];
                    $scope.ywlbDrop = [{
                        DMBMMC: "計量設備移庫",
                        DMBM: "CCS-DM-26"
                    }];
                    break;
            }
        }

        /**
         * 按照排序规则排序
         * @param orderList
         * @returns {*[]}
         */
        function sortOrder(orderList) {
            // （1）预约开始时间和预约结束时间都不为空则为预约工单，其余情况按照接收工单处理（按照接收时间降序排列）
            // （2）当前时间大于预约结束时间，则为超时工单，排在预约工单的最后边并降序排列
            // （3）当前时间小于预约结束时间，则为预约正常工单，按照预约开始时间升序排列，并计算当前时间距预约开始时间的小于60分钟的工单的分钟数
            var yywcsList = [];// 预约未超时的工单
            var yycsList = [];// 预约超时的工单
            var jssjList = [];// 接收时间的工单
            var nowDate = new Date().getTime();
            orderList.forEach(function (item) {
                if (item.apptbegtm && item.apptendtm) {
                    item.apptbegtm = item.apptbegtm.length > 19 ? item.apptbegtm.substring(0, 19) : item.apptbegtm;
                    item.apptendtm = item.apptendtm.length > 19 ? item.apptendtm.substring(0, 19) : item.apptendtm;
                    item.incotm = item.incotm.length > 19 ? item.incotm.substring(0, 19) : item.incotm;
                    // 当前时间与预约结束时间比较，如果当前时间在预约结束时间之后，代表工单已超时，放在后面
                    // 当前时间在预约结束时间之前，则工单未开始，放在前面。升序排列
                    var yyjssj = new Date(item.apptendtm).getTime();
                    if (nowDate - yyjssj <= 0) {
                        // 未超时工单，计算距离工单开始的时间，小于60min则赋值
                        var syTm = Math.floor((new Date(item.apptbegtm).getTime() - nowDate) / 1000 / 60);// 分钟
                        syTm <= 60 ? item.tssj = syTm : null;// 添加提醒时间
                        yywcsList.push(item);
                    } else {
                        yycsList.push(item);
                    }
                } else {
                    // 接收时间的工单
                    item.incotm = item.incotm && item.incotm.length > 19 ? item.incotm.substring(0, 19) : item.incotm;
                    jssjList.push(item);
                }
            });
            yywcsList.sort(function (a, b) {
                return Date.parse(a.apptbegtm) - Date.parse(b.apptbegtm);
            });
            yycsList.sort(function (a, b) {
                return Date.parse(b.apptbegtm) - Date.parse(a.apptbegtm);
            });
            jssjList.sort(function (a, b) {
                return Date.parse(b.incotm) - Date.parse(a.incotm);
            });
            return yywcsList.concat(yycsList, jssjList);
        }

        /**
         * Tab页切换
         * @param type
         */
        $scope.selectSortType = function (type) {
            //$scope.initZfjh(type);
            // queryByTab(allList, type);// 切换时展示的数据
            $scope.query = {jhjcrq: ''};// 重置查询条件  --不知道为什么，页面上计划检查日期清空不了
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
         * 扫一扫电表号码
         */
        $scope.scanMeter = function () {
            NativeService.scan().then(function (data) {
                $scope.query.dbh = data;
            });
        };

        /**
         * 搜索
         */
        $scope.queryOrder = function () {
            if ($scope.SortType === 0) {
                // 当优先级为接收时间时使用原始数据筛选，其他情况使用排序后的数据筛选
                if ($scope.query.yxj === '3') {
                    $scope.notSaveList = queryBucondition(copyNotSave);
                } else {
                    $scope.notSaveList = queryBucondition(copyNotSaveSort);
                }
            } else if ($scope.SortType === 1) {
                $scope.saveList = queryBucondition(copySave);
            } else if ($scope.SortType === 2) {
                $scope.passList = queryBucondition(copyPass);
            }
            $scope.updown = false;
        };

        /**
         * 筛选数据
         * @param list
         * @returns {*}
         */
        function queryBucondition(list) {
            // $scope.query.rwlx == '1168' || $scope.query.rwlx == '1170' || $scope.query.rwlx == '1169' || $scope.query.rwlx == '1171' ||
            if ($scope.query.rwlx && ($scope.query.rwlx == '144;1892' || $scope.query.rwlx == '1890')) {
                return list.filter(function (item) {
                    return (!$scope.query.rwlx || $scope.query.rwlx.indexOf(item.wkflowstdtaskno.toString()) !== -1) && (!$scope.query.dz || (item.equilocdescr && item.equilocdescr.indexOf($scope.query.dz) !== -1))
                        && (!$scope.query.qf || $scope.query.qf == item.areaaddr4) && (!$scope.query.ywlb || $scope.query.ywlb == item.buscatgcd) && (!$scope.query.wgx || (item.thirty == $scope.query.wgx))
                        && (!$scope.query.dbh || (item.asseno && item.asseno.indexOf($scope.query.dbh) !== -1))
                        && (!$scope.query.jhjcrq || (item.plnveridt && item.plnveridt.indexOf($scope.query.jhjcrq) !== -1))
                        && (!$scope.query.hyzh || (item.contractno && item.contractno.indexOf($scope.query.hyzh) !== -1))
                        && (!$scope.query.colorVal || $scope.query.colorVal == item.colorVal) && (!$scope.query.gdh || (item.wkordrno && item.wkordrno.indexOf($scope.query.gdh) !== -1))
                });
            } else {
                return list.filter(function (item) {
                    return (!$scope.query.rwlx || $scope.query.rwlx.indexOf(item.wkflowstdtaskno.toString()) !== -1) && (!$scope.query.dz || (item.equilocdescr && item.equilocdescr.indexOf($scope.query.dz) !== -1))
                        && (!$scope.query.qf || $scope.query.qf == item.areaaddr4) && (!$scope.query.ywlb || $scope.query.ywlb == item.buscatgcd) && (!$scope.query.wgx || (item.thirty == $scope.query.wgx))
                        && (!$scope.query.dbh || (item.asseno && item.asseno.indexOf($scope.query.dbh) !== -1))
                        && (!$scope.query.jhjcrq || (item.plnveridt && item.plnveridt.indexOf($scope.query.jhjcrq) !== -1))
                        && (!$scope.query.hyzh || (item.contractno && item.contractno.indexOf($scope.query.hyzh) !== -1))
                        && (!$scope.query.colorVal || $scope.query.colorVal == item.colorVal) && (!$scope.query.gdh || (item.wkordrno && item.wkordrno.indexOf($scope.query.gdh) !== -1))
                        && (!$scope.query.yxj || $scope.query.yxj == '2' || $scope.query.yxj == '3' || $scope.query.yxj == item.wkprty)
                });
            }
        }

        /**
         *  退出待办界面销毁定时器
         */
        $scope.$on('$destroy', function () {
            $interval.cancel(intervalTask);
            intervalTask = null;
        });

        /**
         * 跳转到办理界面，定时器不会销毁
         * @param item
         */
        $scope.dealWithOrder = function (item) {
            if (item.orderType === '3') {
                hyMui.alert('工單已取消，無法查看');
                return;
            }
            var task = {
                wkflwtachno: item.wkflwtachno,// 环节号？ --> 現場檢查結果錄入
                wkflowinstno: item.wkflowinstno,// 实例号？ --> 現場檢查結果錄入
                wkordrno: item.wkordrno, // 工作单编号
                wkflowtaskno: item.wkflowtaskno, // 工作流实例中的任务号
                wkflowstdtaskno: item.wkflowstdtaskno, // 标准环节号
                buscatgcd: item.buscatgcd, // 业务类别
                cntracctno: item.cntracctno, // 合约账户
                orderType: item.orderType // 工单类型
            };
            if (menu.hjh === '144;1890;1892') {
                if (item.wkflowstdtaskno === 1890) {
                    mainNavi.pushPage('pages/cemydzy/aqyhfcgdbl/cemydzy_aqyhgdfcbl.html', {
                        cancelIfRunning: true,
                        task: task,
                        order: item
                    })
                } else {
                    mainNavi.pushPage('pages/cemydzy/aqyhjcgdbl/cemydzy_aqyhgdbl.html', {
                        cancelIfRunning: true,
                        task: task,
                        order: item
                    })
                }
            } else if (menu.hjh === '118;119;1127') {
                if (item.wkflowstdtaskno === 118) {
                    mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                        cancelIfRunning: true,
                        task: task,
                        order: item
                    })
                } else if (item.wkflowstdtaskno === 1127) {
                    mainNavi.pushPage('pages/cemydzy/zcs/cem_zcsbl.html', {
                        cancelIfRunning: true,
                        task: task,
                        order: item
                    })
                } else {
                    mainNavi.pushPage('pages/cemydzy/zcgdbl/plzcxxlr/cem_plzclr.html', {
                        cancelIfRunning: true,
                        task: task,
                        order: item
                    })
                }
            } else {
                mainNavi.pushPage(menu.workUrl, {
                    cancelIfRunning: true,
                    task: task,
                    order: item
                })
            }
        };

        $scope.$on('SAVE_ORDER_REMOVE_SUCCESS', function (ev, item) {
            if (item && item.getApiFlag) {
                notSaveList = item.notSaveList;
                saveList = item.saveList;
                passList = item.passList;
            }
            queryTaskOrder();
            // 目的：更新新数组中的选中状态。重置界面选中状态，清空checkItem，并重新向数组中添加
            for (var i = 0; i < $scope.saveList.length; i++) {
                checkItem.forEach(function (item) {
                    if (item.wkordrno === $scope.saveList[i].wkordrno) {
                        $scope.saveList[i].isSel = true;
                    }
                })
            }
            checkItem = [];
            for (var j = 0; j < $scope.saveList.length; j++) {
                if ($scope.saveList[j].isSel) {
                    checkItem.push($scope.saveList[j]);
                }
            }
        });

        $scope.colorsDrop = [{
            styleStr: {'background-color': '#ffffff'},
            colorVal: "#ffffff",
            colorName: '白色'
        }, {
            styleStr: {'background-color': '#ff8080'},
            colorVal: "#ff8080",
            colorName: '薔薇色'
        }, {
            styleStr: {'background-color': '#26e4cc'},
            colorVal: "#26e4cc",
            colorName: '青綠色'
        }, {
            styleStr: {'background-color': '#88aaff'},
            colorVal: "#88aaff",
            colorName: '桔梗色'
        }, {
            styleStr: {'background-color': '#ffdc69'},
            colorVal: "#ffdc69",
            colorName: '鬱金色'
        }, {
            styleStr: {'background-color': '#c088f7'},
            colorVal: "#c088f7",
            colorName: '菖蒲色'
        }, {
            styleStr: {'background-color': '#74787c'},
            colorVal: "#74787c",
            colorName: '薄墨色'
        }, {
            styleStr: {'background-color': '#b76f40'},
            colorVal: "#b76f40",
            colorName: '琥珀色'
        }, {
            styleStr: {'background-color': '#2585a6'},
            colorVal: "#2585a6",
            colorName: '薄花色'
        }];


        /**
         * 创建颜色选择面板
         */
        var initDialog = function () {
            ons.ready(function () {
                ons.createDialog('pages/common/home/selectColor.html', {parentScope: $scope}).then(function (dialog) {
                    searchDialog = dialog;
                });
            });
        };

        initDialog();

        /**
         * 确认选择的颜色
         * @param item
         */
        $scope.confirmColor = function (item) {
            searchDialog.hide();
            if (queryFlag === 'query') {
                $scope.query.colorVal = item.colorVal;
                $scope.query.colorName = item.colorName;
                return;
            }
            orderColorRemark.colorStyle = item.styleStr;
            orderColorRemark.colorVal = item.colorVal;
            $hyUtil.saveLocal(TFConstant.LOCAL_NOT_SAVE, notSaveList);
        };

        /**
         * 打开选择颜色弹窗
         * @param item 需要选择颜色的工单
         * @param flag 区分查询跳转还是选择跳转
         */
        $scope.showColor = function (item, flag) {
            queryFlag = flag;
            if (item) {
                orderColorRemark = item;
            }
            searchDialog.show();
        };

        /**
         * 清除颜色查询条件
         */
        $scope.clearData = function () {
            $scope.query.colorName = '';
            $scope.query.colorVal = '';
        };

        $scope.pullDownOption = {
            content: "下拉刷新",
            downContent: "下拉刷新",
            upContent: "鬆開刷新",
            loadingContent: "<div><i class='fa fa-spinner pull-load-icon'></i></div>"
        };

        $scope.pullDownLoad = function ($done) {
            $scope.query = {jhjcrq: ''};// 重置查询条件
            allList = [];// 重置全局的数据
            var params = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "qryVO": {
                    "curhand": $appConfig.userInfo.RYBS,
                    "curorg": "",
                    "wkflowstdtaskno": menu.hjh
                }
            };
            homeService.queryGrdbOrderList(params).then(function (data) {
                $scope.init = true;
                if (data.resultVo.rslt === '0') {
                    allList = data.voList;
                    if (allList.length <= 0) return;
                    allList.forEach(function (item) {
                        item.incotm = item.incotm.substring(0, item.incotm.length - 2);
                        if (menu.hjh === 784 && item.arresetttm) {
                            // 复电剩余时间计算
                            item.arresetttmMc = timeLeft(item.arresetttm);
                        }
                        if (menu.hjh === 1168 || menu.hjh === 1170 || menu.hjh === 1169 || menu.hjh === 1171) {
                            // 现场检查：翻译业务类别
                            item.ywlbBz = true;// 控制界面显隐
                            item.buscatgcdMc = translateDmfl(item.buscatgcd);
                        }
                    });
                    allList.sort(function (a, b) {
                        return Date.parse(b.incotm) - Date.parse(a.incotm);
                    });// 按照接收时间降序排列
                    queryByTab(allList, $scope.SortType);
                } else {
                    hyMui.toast({message: '獲取個人待辦失敗'})
                }
                $done();
            }, function () {
                $scope.error = true;
                $done();
            });
        };

        var checkItem = [];
        /**
         * 复选框
         * @param item
         */
        $scope.plSelected = function (item) {
            if (!item) {
                return;
            }
            item.isSel = !item.isSel;
            var index = checkItem.indexOf(item);//获取每一个item的位置
            //判断item是否存在数组
            if (index >= 0) { //存在的话点击会移出数组
                checkItem.splice(index, 1);
            } else {
                checkItem.push(item);
            }
        };

        /**
         * 全选 / 取消全选
         */
        $scope.selectAllItem = function () {
            $scope.selectAll = !$scope.selectAll;
            $scope.saveList.forEach(function (item) {
                if ($scope.selectAll) {
                    // 全选
                    if (!item.isSel) {
                        $scope.plSelected(item);
                    }
                } else {
                    // 取消全选
                    if (item.isSel) {
                        $scope.plSelected(item);
                    }
                }
            });
        };

        /**
         * 传递
         * @returns {boolean}
         */
        $scope.sendSelect = function () {
            if (!navigator.onLine) {
                hyMui.alert('暫無網絡，無法傳遞');
                return;
            }
            if (checkItem.length > 0) {
                for (var i = 0; i < checkItem.length; i++) {
                    if (checkItem[i].offLineState) {
                        hyMui.alert('存在離線工單，無法傳遞');
                        return;
                    }
                }
                sendSelectedOrder(checkItem);
            } else {
                hyMui.alert('請選擇傳遞工單')
            }
        };

        function sendSelectedOrder(list) {
            var sendSelectedOrderItem = function (index) {
                index = index || 0;
                if (list.length <= index) {
                    return;
                }
                var taskInfo = {
                    wkordrno: list[index].wkordrno,
                    wkflowinstno: list[index].wkflowinstno,
                    wkflowtaskno: list[index].wkflowtaskno
                };
                hyMui.loaderShow();
                TaskService.passGzd(taskInfo).then(function (data) {
                    hyMui.loaderHide();
                    if (data && data.rslt === '0') {
                        list[index].orderType = '2';// 工单状态，1.已保存 2.已传递
                        list[index].localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_PASS_ORDER", list[index]);
                        if (index === list.length - 1) {
                            hyMui.alert('工單傳遞完成');
                        }
                        list.splice(index, 1);
                    } else {
                        hyMui.alert(list[index].wkordrno + " 工單傳遞失敗");
                        index++;
                    }
                    sendSelectedOrderItem(index);
                }, function () {
                    hyMui.loaderHide();
                });
            };
            sendSelectedOrderItem();
        }

    }]);