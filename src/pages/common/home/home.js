/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/10
 * 首頁
 */
app.controller('HomesCtrl', ['$scope', '$appConfig', 'MenuService', '$hyUtil', 'homeService', '$interval', '$rootScope', '$filter', 'systemDropList',
    'PhotoService', 'PassOrderService', 'tdblService', 'TFConstant', 'ToolService', 'OfflineOrderService', 'xcjcService', 'OfflineParamService',
    'TaskService', 'NativeService', 'aqyhjcService', 'fdblService', 'zcgdfpService', 'lhjcService', 'gzclService', 'lsjdService', 'zcgdblsService',
    'azwzxxService', 'dxxxService', 'HyGeolocationView', 'ggsbkwService',
    function ($scope, $appConfig, MenuService, $hyUtil, homeService, $interval, $rootScope, $filter, systemDropList,
              PhotoService, PassOrderService, tdblService, TFConstant, ToolService, OfflineOrderService, xcjcService, OfflineParamService,
              TaskService, NativeService, aqyhjcService, fdblService, zcgdfpService, lhjcService, gzclService, lsjdService, zcgdblsService,
              azwzxxService, dxxxService, HyGeolocationView, ggsbkwService) {
        //待办任务列表
        $scope.taskList = [];// 页面展示数据
        $scope.moreFlag = false;// 更多按鈕,默认未展开
        $scope.move = false;// 默认不可以移动
        $scope.query = {};// 查询条件
        $scope.SortType = 0;
        $scope.languageSrc = 'img/cem/home/cem_not_drag.png';
        var rybs = $appConfig.userInfo.RYBS;
        var showMenus = [];// 当前登录人可查看的菜单集合
        var showNum = 4;// 默认可展示菜单数量
        var localMenus = [];// 缓存当前登录人的菜单
        var yyNum = 0;// 本地通知Id
        var getOrderAPITask = null;// 定时请求接口刷新待办列表
        var intervalTask = null;// 定时刷新本地待办并通知不足一小时工单
        var remainingTask = null;// 复电剩余时间通知
        var synchronizeTask = null;// 数据同步任务
        var synLocationTask = null;// 定时上传经纬度
        var orderColorRemark = null; // 工单颜色标注
        var searchDialog = null;// 选择颜色Dialog
        var synchronizeDialog = null;// 數據同步Dialog
        var queryFlag = null;// 查询颜色标志
        var reminderTime = $hyUtil.getLocal(TFConstant.LOCAL_REMINDER_TIME) || 60; // 预约提醒时间
        var menus = [
            {
                src: 'img/cem/home/cem_aqyhjc.png',
                menuName: '电表拆换',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/aqyhjcgdbl/cemydzy_aqyhgdbl.html',
                num: 0,
                hjh: '144;1890;1892', /* 144 '2' */
                show: false
            }, {
                src: 'img/cem/home/cem_zcrw.png',
                menuName: '电表拆换',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/zcgdbl/cem_zcgdbl.html',
                num: 0,
                hjh: '118;119;1127', /* 118 '3' */
                show: true
            }, {
                src: 'img/cem/home/cem_xcjc.png',
                menuName: '用电申请',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/xcjcbl/cemydzy_xcjcrwbl.html',
                num: 0,
                hjh: '1168;1170;1169;1171',
                // hjh: 190, /* 190 '1' */
                show: true
            }, {
                src: 'img/cem/home/cem_more.png',
                menuName: '工作传票',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/zcgd/cemydzy_zcgdfp.html',
                num: 0,
                hjh: '115', /* 115 '8' */
                show: true
            },
            {
                src: 'img/cem/home/cem_lsjd.png',
                menuName: '工作传票',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/lsjd/cem_lsjdbl.html',
                num: 0,
                hjh: '98', /* 98 '9' */
                show: false
            },
            {
                src: 'img/cem/home/cem_lhjc.png',
                menuName: '聯合檢查',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/lhjc/cem_lhjcbl.html',
                num: 0,
                hjh: '1128', /* '4' */
                show: false
            },
            {
                src: 'img/cem/home/cem_gzcl.png',
                menuName: '故障處理',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/gzcl/cem_gzclbl.html',
                num: 0,
                hjh: '526', /* 526 '5' */
                show: false
            },
            {
                src: 'img/cem/home/cem_fdjc.png',
                menuName: '復電辦理',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/fdbl/cem_fdbl.html',
                num: 0,
                hjh: '784', /* 784 '6' */
                show: false
            },
            {
                src: 'img/cem/home/cem_tdbl.png',
                menuName: '停電辦理',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/tdbl/cem_tdbl.html',
                num: 0,
                hjh: '779', /* 779 '7' */
                show: false
            },
            {
                src: 'img/cem/home/cem_zcrw.png',
                menuName: '裝拆辦理',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/zcgdbl/cem_zcgdbl.html',
                num: 0,
                hjh: '118;119;1127', /* 118 '3' */
                show: false
            },
            {
                src: 'img/cem/home/cem_zcgdcj.png',
                menuName: '裝拆工單創建',
                target: 'pages/cemydzy/zcgd/cemydzy_zcgdcj.html',
                workUrl: '',
                num: 0,
                hjh: '0',// 没有环节号，默认为0
                show: false
            },
            {
                src: 'img/cem/home/cem_aqyhjc.png',
                menuName: '移庫',
                target: 'pages/common/dblb/cem_dblb.html',
                workUrl: 'pages/cemydzy/ggsbkw/cem_ggsbkw.html',
                num: 0,
                hjh: '2100',
                show: false
            },
            {
                src: 'img/cem/home/cem_dxxxcx.png',
                menuName: '信息查詢',
                target: 'pages/cemydzy/dxxxcx/cem_dxxxcx.html',
                workUrl: 'pages/cemydzy/fdbl/cem_fdbl.html',
                num: 0,
                hjh: '0',// 没有环节号，默认为0
                show: false
            },
            {
                src: 'img/cem/home/cem_sjsc.png',
                menuName: '數據同步',
                target: '',
                workUrl: '',
                num: 0,
                hjh: '0',// 没有环节号，默认为0
                show: false
            }
        ];

        systemDropList.getDropInfoList('REGIONCD').then(function (list) {
            $scope.qfDrop = list;
        });

        /**
         * 更多按钮的展示与隐藏
         * $scope.moreFlag 控制展开与收缩
         * $scope.moreBz 控制按钮的显隐
         * @param flag
         */
        $scope.showMore = function (flag) {
            $scope.moreFlag = !$scope.moreFlag;
            var newMenus = angular.copy(showMenus);
            if (newMenus.length > showNum) {
                $scope.moreBz = true;
                $scope.menus = flag ? newMenus : newMenus.splice(0, showNum);
            } else {
                $scope.menus = newMenus;
                $scope.moreBz = false;
            }
        };

        function refreshMenus(flag, order) {
            // 刷新属于当前登录人的菜单数据
            showMenus.forEach(function (item) {
                item.num = countNum(item.hjh, order);
            });
            var newMenus = angular.copy(showMenus);
            if (newMenus.length > showNum) {
                $scope.moreBz = true;
                $scope.menus = flag ? newMenus : newMenus.splice(0, showNum);
            } else {
                $scope.menus = newMenus;
                $scope.moreBz = false;
            }
        }

        /**
         * 移动菜单并保存移动后的顺序
         */
        $scope.moveMenus = function () {
            $scope.move = !$scope.move;
            if ($scope.move) {
                $scope.languageSrc = 'img/cem/home/cem_drag.png';//可拖動
            } else {
                $scope.languageSrc = 'img/cem/home/cem_not_drag.png'//不可拖動
            }
            if (!$scope.move) {
                // 点击完成时的操作
                if (showMenus.length <= showNum) {
                    showMenus = $scope.menus;
                } else {
                    // 大于showNum的情况分展开和不展开
                    // 不展开状态：前showNum个为调整顺序的，后面的保持不变
                    showMenus = $scope.moreFlag ? $scope.menus.concat(showMenus.splice(showNum)) : $scope.menus;
                }
                saveLocalMenu(showMenus);
            }
        };

        /**
         * 本地缓存当前登录人对应的菜单
         * @param localMenu
         */
        function saveLocalMenu(localMenu) {
            if (localMenus.length > 0) {
                for (var i = 0; i < localMenus.length; i++) {
                    if (localMenus[i].rybs === rybs) {
                        localMenus[i].menu = localMenu
                    } else {
                        var menuObj = {
                            rybs: rybs,
                            menu: localMenu
                        };
                        localMenus.push(menuObj);
                    }

                }
            } else {
                var menuObjs = {
                    rybs: rybs,
                    menu: localMenu
                };
                localMenus.push(menuObjs);
            }
            $hyUtil.saveLocal(TFConstant.LOCAL_HOME_MENUS, localMenus);
        }

        /**
         * 初始化
         * 1.筛选登录人可查看的菜单
         * 2.清空今天零点之前的工单
         * 3.请求工单数据（未办理）并与本地缓存工单数据比较
         *  1）在已保存或者未办理都不存在的工单添加的未办理tab的首位
         *  2）工单排序
         */
        function initGdList() {
            getLocalKey();// 初始化LocalStorage中的key
            getNewsMessage();// 接收M+发送的消息
            $scope.notSaveOrder = $hyUtil.getLocal(TFConstant.LOCAL_NOT_SAVE) || [];// 未保存
            $scope.saveOrder = $hyUtil.getLocal(TFConstant.LOCAL_SAVE) || [];// 已保存
            $scope.passOrder = $hyUtil.getLocal(TFConstant.LOCAL_PASS) || [];// 已传递
            userMenus();// 属于当前用户可查看的菜单
            clearHistoryOrder();// 清除历史数据
            if ($appConfig.userInfo.MRHTID && $appConfig.userInfo.MRHTNO) {
                intervalSynLocationTask();
            }
            //每隔10分钟定时上传经纬度,抄表终端唯一标识MRHTID和抄表终端编号MRHTNO为空，代表此设备未在pc端做维护功能，不能执行上传经纬度服务
            if (!synLocationTask && $appConfig.userInfo.MRHTID && $appConfig.userInfo.MRHTNO) {
                synLocationTask = $interval(intervalSynLocationTask, 10 * 60 * 1000);
            }
            // 有无网络的情况
            if (navigator.onLine) {
                // 有网络则正常请求接口
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
                        "wkflowstdtaskno": "1168;1170;1169;1171;144;1890;1892;98;1128;526;784;779;118;119;1127;2100"
                    }
                };
                hyMui.loaderShow();
                homeService.queryGrdbOrderList(params).then(function (data) {
                    hyMui.loaderHide();
                    if (data.resultVo.rslt === '0') {
                        // 1.工单分组并返回新增工单数组
                        var newOrderFilter = orderGrouping(data);
                        // 2.筛选停电工单并保存停电下载时间
                        var tdgdList = filterTdOrder(newOrderFilter);
                        tdgdList.length > 0 ? homeService.saveDownloadTime(tdgdList) : null;
                        // 3.控制工单字段展示
                        controlOrderTitle();
                        // 4.未办理工单排序
                        $scope.notSaveOrder = orderList($scope.notSaveOrder);
                        // 5.加载菜单并统计右上角数量
                        loadedMenu();
                        // 6.本地数据刷新以及发送预约工单通知
                        if (!intervalTask) {
                            intervalTask = $interval(intervalList(), 300000);
                        }
                        // 7.有网络的情况下，按照设置的时间定时请求接口
                        var sysTime = $hyUtil.getLocal(TFConstant.LOCAL_ORDERAPI_TIME);
                        var intervalTime = (sysTime && sysTime.ms) || 180000;
                        getOrderAPITask = $interval(getOrderAPI, intervalTime);
                        // 8.半小时自动数据同步
                        if (!synchronizeTask) {
                            synchronizeTask = $interval(intervalSynchronizeTask, 30 * 60 * 1000);
                        }
                    } else {
                        $scope.menus = menus;
                        hyMui.toast({message: '獲取個人待辦失敗'})
                    }
                }, function () {
                    $scope.menus = menus;
                    hyMui.loaderHide();
                });
            } else {
                // 1.加载菜单并统计右上角数量
                loadedMenu();
                // 2.本地数据刷新以及发送预约工单通知
                if (!intervalTask) {
                    intervalTask = $interval(intervalList(), 300000);
                }
                // 3.按照设置的时间定时请求接口（实际计算复电剩余时间）
                var sysTime = $hyUtil.getLocal(TFConstant.LOCAL_ORDERAPI_TIME);
                var intervalTime = (sysTime && sysTime.ms) || 180000;
                getOrderAPITask = $interval(getOrderAPI, intervalTime);
            }
        }

        initGdList();

        /**
         * 工单分组（已保存、未办理）
         * @param data 查询接口返回的工单
         * @returns {Array} 新增工单数组
         */
        function orderGrouping(data) {
            var newOrderFilter = [];// 新工单
            var notSaveConcatSaveOrder = $scope.notSaveOrder.concat($scope.saveOrder);
            for (var i = 0; i < data.voList.length; i++) {
                data.voList[i].asseno = $filter('shortenNumber')(data.voList[i].asseno); // 去零
                data.voList[i].orderType = '';
                data.voList[i].localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                // 1.根据工单号、标准环节号、任务号判断此工单是否存在于本地缓存中
                // 循环接口返回工单数组，其中一项与本地工单比较，如果在本地中不存在完全相同的，则视为新工单
                // 新工单需要新增到未办理中，需要先移除已完成和未办理中存在相同工单号的工单，再添加
                var addFlag = notSaveConcatSaveOrder.some(function (value) {
                    return (value.wkordrno === data.voList[i].wkordrno
                        && value.wkflowstdtaskno === data.voList[i].wkflowstdtaskno // 標準環節號
                        && value.wkflowtaskno === data.voList[i].wkflowtaskno) // 任務號
                });
                // 2.不存在（包括了工单流转，如传递下一环节或回退上一环节）则需要移除再添加至未办理中
                if (!addFlag) {
                    for (var j = 0; j < $scope.saveOrder.length; j++) {
                        // 停电取消工单不移除
                        if ($scope.saveOrder[j].wkordrno === data.voList[i].wkordrno) {
                            $scope.saveOrder.splice(j, 1);
                            break;
                        }
                    }
                    for (var m = 0; m < $scope.notSaveOrder.length; m++) {
                        if ($scope.notSaveOrder[m].wkordrno === data.voList[i].wkordrno) {
                            $scope.notSaveOrder.splice(m, 1);
                            break;
                        }
                    }
                    // 1)放入新增工单数组
                    newOrderFilter.push(data.voList[i]);
                    $scope.notSaveOrder.unshift(data.voList[i]);
                }
            }
            $scope.notSaveOrder.push({
                "wkordrno":"110000016645",
                "wkflwtachno":"6",
                "wkflowtaskno":"4",
                "personName":null,
                "incotm":"2020-09-07 16:01:38.0",
                "buscatgcd":"CCS-DM-18",
                "asseno":"000000000000M10043",
                "equilocdescr":"澳門氹仔基馬拉斯大馬路 79-81 豐收花園 42樓 4201",
                "equilocengldescr":"Room 4201, 42th Floor, Harvest Garden,Avenida de Guimar?es 79-81 ,Taipa,Macau,China",
                "contractno":"5000013140",
                "newflag":"0",
                "thirty":"0",
                "fldtsktyp":"04",
                "apptbegtm":null,
                "apptendtm":null,
                "veridt":null,
                "plnveridt":null,
                "wkflowinstno":32973,
                "wkflwtachnm":"Safety Risk Inspection Result Entry",
                "wkflowstdtaskno":115,
                "arresetttm":null,
                "wkprty":null,
                "long1":null,
                "lati1":null,
                "lon":null,
                "lati":null,
                "areaaddr4":null
            });
            // 3.本地缓存中存在，但是不存在于接口返回中（此情况为PC端操作了工单，比如作废、闭环），需要从本地移除
            removeLocalOrder($scope.notSaveOrder, data.voList);
            removeLocalOrder($scope.saveOrder, data.voList);
            // 保存到本地缓存中
            $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
            $hyUtil.saveLocal(TFConstant.LOCAL_NOT_SAVE, $scope.notSaveOrder);
            return newOrderFilter;
        }

        /**
         * 移除在PC端操作过的本地工单
         * @param localOrder 本地工单
         * @param apiOrder 接口请求工单
         */
        function removeLocalOrder(localOrder, apiOrder) {
            for (var i = 0; i < localOrder.length; i++) {
                // 停电取消工单不移除
                if (localOrder[i].orderType !== '3') {
                    var saveFlag = apiOrder.some(function (value) {
                        return value.wkordrno === localOrder[i].wkordrno
                    });
                    // 不存在则移除
                    if (!saveFlag) {
                        localOrder.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        /**
         * 加载菜单并统计菜单右上角工单数量
         * @param flag 区分初始化 和 定时请求与下拉刷新 操作
         */
        function loadedMenu(flag) {
            flag = flag || '';
            var countOrderList = $scope.notSaveOrder.concat($scope.saveOrder);// 统计工单数量数组
            menus.forEach(function (item) {
                item.num = countNum(item.hjh, countOrderList);
            });
            if (!flag) {
                // 初始化操作
                showMenus.forEach(function (item) {
                    item.num = countNum(item.hjh, countOrderList);
                });
                $scope.showMore($scope.moreFlag);
            } else {
                // 定时请求与下拉刷新操作
                refreshMenus(!$scope.moreFlag, countOrderList);
            }
        }

        /**
         * 筛选停电工单
         * @param tdOrderList
         * @returns {Array}
         */
        function filterTdOrder(tdOrderList) {
            var order = [];
            tdOrderList.filter(function (item) {
                if (item.wkflowstdtaskno.toString() === '779') {
                    var obj = {
                        flag: 'TDBZ',
                        oprtr: rybs,
                        wkordrno: item.wkordrno
                    };
                    order.push(obj);
                    return true;
                }
            });
            return order
        }

        /**
         * 扫一扫电表号码
         */
        $scope.scanMeter = function () {
            NativeService.scan().then(function (data) {
                $scope.query.dbh = data;
            });
        };

        /**
         * 初始化LocalStorage中的key
         */
        function getLocalKey() {
            TFConstant.LOCAL_NOT_SAVE = 'home_not_save_order' + rybs;
            TFConstant.LOCAL_SAVE = 'home_save_order' + rybs;
            TFConstant.LOCAL_PASS = 'home_pass_order' + rybs;
            // TFConstant.LOCAL_REMINDER_TIME = 'cem_appointment_reminder_time' + rybs;
            // TFConstant.LOCAL_ORDERAPI_TIME = 'cem_get_orderAPI_time' + rybs;
            TFConstant.LOCAL_MJ_NEWS = 'cem_mj_news' + rybs;
            TFConstant.LOCAL_HOME_MENUS = 'cem_home_own_menus' + rybs;
            TFConstant.LOCAL_CLEAR_TIME = 'home_clear_order' + rybs;
            TFConstant.LOCAL_PROMPT_TIME = 'home_prompt_time' + rybs;
            TFConstant.LOCAL_PHOTO_ARY = 'cem_photo_ary' + rybs;
            TFConstant.LOCAL_REMINDER_WORKER = 'ydzy_local_reminder_worker' + rybs;
        }

        /**
         * 构建下拉数据
         */
        function getSystemDrop() {
            var localDrop = $hyUtil.getLocal('__WGJL_SYSCODE_DROP') || {};
            // 如果 dropList.length 变化，判断中的值需要一起变化
            if (Object.getOwnPropertyNames(localDrop).length !== 44) {
                var dropList = ['MODFLGCD', 'GISTYPECD', 'DSTRCD', 'EQUITYPCD', 'RCNNTORDRTYPCD', 'SEALLOCCD', 'SEALEQUICATECD', 'RCNNTRSLTCD',
                    'RCNNTFAILRSNCD', 'DISCONMETHCD', 'LOADCODECD', 'MCBTYPCD', 'MCBINSTLOCCD', 'BAUDRTCD', 'FAULHANDMDECD', 'EQUITSTITMCD', 'FLDTSKTYPCD', 'EQUICLASCD',
                    'DISCONORDRTYPCD', 'DISCONFAILRSNCD', 'DISCONRSLTCD', 'PHASTYPCD', 'IRRSNCD', 'PRCTYPCD', 'CURTRANRATICD', 'NOMCURCD', 'NOMVOLTCD', 'VOLTTRANRATICD',
                    'PHASLNCD', 'MASTANDSLAVFLGCD', 'READTYPCD', 'MANUCD', 'IRFLGCD', 'NONIRRSNCD', 'PREMTYPCD', 'PREMPROPCD', 'PREMSTSCD', 'CUSTTYPCD',
                    'CONTACCTCATGCD', 'INDUCLASCD', 'MASTANDSLAVMTRFLGCD', 'REGIONCD', 'WARENMCD', 'WHLCTCD', 'POTNRISKCATGCD', 'POTNRISKTYPCD', 'FUSEAPCD'];
                dropList.forEach(function (value) {
                    systemDropList.getDropInfoList(value);
                })
            }
        }

        /**
         * 请求离线工单办理界面数据
         * 思路：请求初始化接口，封装接口返回数据，保存到本地数据库
         * @param order
         * @param condition 提示消息参数
         */
        function getOfflineOrderInfo(order, condition) {
            // 1168;1170;1169;1171;144;98;1128;526;784;779;118;115
            var hjh = order.wkflowstdtaskno + '';
            var param = {
                "wkflwtachno": order.wkflwtachno,
                "wkordrno": order.wkordrno
            };
            switch (hjh) {
                case '1168':
                case '1169':
                case '1170':
                case '1171':
                    getCommonInfo(xcjcService, 'queryXcjcOrderInfo', order, callbackFn, param, condition);
                    break;
                case '144':
                case '1892':
                    getCommonInfo(aqyhjcService, 'queryAqyhjcOrderInfo', order, callbackFn, param, condition);
                    break;
                case '1890':
                    getCommonInfo(aqyhjcService, 'queryAqyhfcOrderInfo', order, callbackFn, param, condition);
                    break;
                case '779':
                    param = {
                        "vo": {
                            "disconordrno": order.wkordrno
                        }
                    };
                    getCommonInfo(tdblService, 'queryTdblGzdDetails', order, callbackFn, param, condition);
                    break;
                case '784':
                    param = {
                        "pageInfo": {
                            "allPageNum": 0,
                            "allRowNum": 0,
                            "curPageNum": 1,
                            "rowOfPage": 100
                        },
                        "rcnntordrno": order.wkordrno
                    };
                    getFdblInfo(fdblService, 'queryFdblGzdDetails', order, callbackFn, param, condition);
                    break;
                case '115':
                    param = {
                        "pageInfo": {
                            "allPageNum": 0,
                            "allRowNum": 0,
                            "curPageNum": 1,
                            "rowOfPage": 10
                        },
                        "vo": {
                            "wkflwtachno": order.wkflwtachno,
                            "wkordrno": order.wkordrno
                        }
                    };
                    getCommonInfo(zcgdfpService, 'queryZcgdfpOrderInfo', order, callbackFn, param, condition);
                    break;
                case '1128':
                    param = {
                        "jointinspectionentityVO": {
                            "wkflwtachno": order.wkflwtachno,
                            "wkordrno": order.wkordrno
                        },
                        "pageInfo": {
                            "allPageNum": 0,
                            "allRowNum": 0,
                            "curPageNum": 1,
                            "rowOfPage": 100
                        }
                    };
                    getNestedCommonInfo(lhjcService, ['queryLhjcOrderInfo', 'queryLhjcLockInfo'], order, callbackFn, param, condition);
                    break;
                case '526':
                    param = {
                        "appVO": {
                            "wkflwtachno": "",
                            "wkordrno": order.wkordrno
                        },
                        "pageInfo": {
                            "allPageNum": 0,
                            "allRowNum": 0,
                            "curPageNum": 0,
                            "rowOfPage": 100
                        }
                    };
                    getCommonInfo(gzclService, 'queryGzsbOrderInfo', order, callbackFn, param, condition);
                    break;
                case '98':
                    param = {
                        "wkflwtachno": order.wkflwtachno,
                        "wkordrno": order.wkordrno
                    };
                    getCommonInfo(lsjdService, 'queryLsjdOrderInfo', order, callbackFn, param, condition);
                    break;
                case '118':
                    // 装拆工单办理
                    getZcgdblOfflineOrder(order, condition);
                    break;
                case '119':
                    // 批量装拆工单信息录入
                    getPlzclrOfflineOrder(order, condition);
                    break;
                case '1127':
                    // 批量装拆锁
                    param = {
                        "wkordrno": order.wkordrno,
                        "inFlag": 'ZCS'
                    };
                    getCommonInfo(zcgdblsService, 'queryZcgdblOrderInfo', order, callbackFn, param, condition);
                    break;
                case '2100':
                    // 更改设备库位
                    param = param = {
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
                    getCommonInfo(ggsbkwService, 'queryPackEquipList', order, callbackFn, param, condition);
                    break;
            }
        }

        function callbackFn(data, hjh) {
            hjh = hjh + '';
            var param = null;
            switch (hjh) {
                case '1168':
                case '1169':
                case '1170':
                case '1171':
                    param = {
                        xcjcInfo: data.infoVo || {},
                        jcxmList: data.jcxmList || []
                    };
                    break;
                case '144':
                case '1892':
                    param = {
                        aqyhjcInfo: data.infoVo || {},
                        jcxmList: data.jcxmList || []
                    };
                    break;
                case '1890':
                    param = {
                        aqyhfcInfo: data.infoVo || {},
                        lastList: data.jcxmList || [],
                        newList: data.newList || []
                    };
                    break;
                case '779':
                    param = {
                        infoVo: data.infoVo || {},
                        infoList: data.infoList || [],
                        flag: 'init'
                    };
                    break;
                case '784':
                    param = {
                        infoVo: data.infoVo || {},
                        infoList: data.infoList || [],
                        flag: 'init'
                    };
                    break;
                case '115':
                    param = {
                        zcfpVo: data.zcfpVo || {}
                    };
                    break;
                case '1128':
                    param = {
                        infoVo: data.infoVo || {},
                        flag: 'init'
                    };
                    break;
                case '526':
                    param = {
                        qryfalhandtskinfoVO: data.qryfalhandtskinfoVO || {},
                        qryfalhanddetlinfoVOList: data.qryfalhanddetlinfoVOList || [],
                        flag: 'init'
                    };
                    break;
                case '98':
                    param = {
                        infoVo: data.infoVo || {},
                        jcxmList: data.jcxmList || [],
                        sbList: data.sbList || [],
                        flag: 'init'
                    };
                    break;
                case '1127':
                    param = {
                        infoVo: data.infoVo || {},
                        sealList: data.sealList || [],
                        flag: 'init'
                    };
                    break;
                case '2100':
                    param = {
                        ckxx: {},
                        yrsbList: [],
                        yrsbSysList: data.sbList || []
                    };
                    break;
            }
            return param;
        }

        /**
         * 工单查询公用方法
         * @param serviceAPI 服务名称
         * @param serviceName 调用方法名称
         * @param order 工单
         * @param callback 组装保存参数
         * @param param 请求入参
         * @param condition 提示消息参数
         */
        function getCommonInfo(serviceAPI, serviceName, order, callback, param, condition) {
            if (condition.successDown === 0 && condition.failDown === 0) hyMui.loaderShow();
            serviceAPI[serviceName](param).then(function (data) {
                var orderInfo = callback && callback(data, order.wkflowstdtaskno);
                var flag = "";
                if (order.wkflowstdtaskno == '98') {
                    flag = "lsjd";
                }
                if (order.wkflowstdtaskno == '526') {
                    flag = "gzcl";
                }
                OfflineOrderService.saveOfflineOrder(orderInfo, order, flag);
                lastDowloadToast(condition, 'success');
            }, function () {
                lastDowloadToast(condition, 'fail');
            });
        }

        /**
         * 工单嵌套查询公用方法
         * @param serviceAPI 服务名称
         * @param serviceName 调用方法名称，数组（含有嵌套查询情况）
         * @param order 工单
         * @param callback 组装保存参数
         * @param param 请求入参
         * @param condition 提示消息参数
         */
        function getNestedCommonInfo(serviceAPI, serviceName, order, callback, param, condition) {
            var firstService = serviceName[0];// 第一层请求
            if (condition.successDown === 0 && condition.failDown === 0) hyMui.loaderShow();
            serviceAPI[firstService](param).then(function (data) {
                var orderInfo = callback && callback(data, order.wkflowstdtaskno);
                var secondService = serviceName[1];// 第二层请求
                var params = {
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 1,
                        "rowOfPage": 100
                    },
                    "vo": {
                        "metepntno": data.infoVo.metepntno,
                        "wkordrno": data.infoVo.wkordrno
                    }
                };
                serviceAPI[secondService](params).then(function (data) {
                    orderInfo.voList = data.voList;
                    OfflineOrderService.saveOfflineOrder(orderInfo, order);
                }, function () {
                    OfflineOrderService.saveOfflineOrder(orderInfo, order);
                });
                lastDowloadToast(condition, 'success');
            }, function () {
                lastDowloadToast(condition, 'fail');
            });
        }

        /**
         * 查询复电办理工单
         * @param serviceAPI
         * @param serviceName
         * @param order
         * @param callback
         * @param param
         * @param condition
         */
        function getFdblInfo(serviceAPI, serviceName, order, callback, param, condition) {
            if (condition.successDown === 0 && condition.failDown === 0) hyMui.loaderShow();
            fdblService.queryFdblGzdDetails(param).then(function (data) {
                var orderInfo = callback && callback(data, order.wkflowstdtaskno);
                if (data && data.infoVo && data.infoVo.lsttdbs) {
                    var param = {
                        "paramMap": {
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 100
                            },
                            "module": "workOrder",
                            "businessNo": data.infoVo.lsttdbs
                        }
                    };
                    dxxxService.queryInfoFileId(param).then(function (data) {
                        if (data.length > 0) {
                            orderInfo.localImgData = data;// 缓存到离线数据中
                            // 下载图片
                            for (var i = 0; i < data.length; i++) {
                                getImgBase64(i, data[i]);
                            }
                        }
                        OfflineOrderService.saveOfflineOrder(orderInfo, order);
                    }, function () {
                        OfflineOrderService.saveOfflineOrder(orderInfo, order);
                    });
                }
                lastDowloadToast(condition, 'success');
            }, function () {
                lastDowloadToast(condition, 'fail');
            })
        }

        /**
         * 请求图片：先从本地查找，未找到则请求接口并保存到本地
         * @param index
         * @param id
         */
        function getImgBase64(index, id) {
            if (!id) return;
            PhotoService.getPhoto(id).then(function (value) {
                if (value.length <= 0) {
                    var param = {
                        "paramMap": {
                            "fileId": id
                        }
                    };
                    TaskService.queryImgBase64(param).then(function (data) {
                        if (!data.osString) return;
                        var obj = {
                            fileId: id,
                            base: data.osString
                        };
                        PhotoService.savePhoto(obj)
                    }, function () {
                    });
                }
            });
        }

        /**
         * 批量装拆信息录入
         * @param order
         * @param condition
         */
        function getPlzclrOfflineOrder(order, condition) {
            if (condition.successDown === 0 && condition.failDown === 0) hyMui.loaderShow();
            var param = {
                "wkordrno": order.wkordrno
            };
            zcgdblsService.queryZcgdblOrderInfo(param, 'pllr').then(function (data) {
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
                // 1、批量装拆任务组装 [{task:{},orderInfo:{}}]
                var taskOrder = [];
                for (var i = 0; i < data.infoVo.length; i++) {
                    var fcbh = data.infoVo[i].premno;
                    var metepntno = data.infoVo[i].metepntno;
                    var rwlb = {
                        wkordrno: order.wkordrno,
                        contractno: order.contractno,
                        premno: fcbh
                    };
                    var pageOrderInfo = pllrZh(fcbh, metepntno, data);
                    var task = {
                        rwlb: rwlb,
                        bljm: pageOrderInfo
                    };
                    taskOrder.push(task);
                }
                // 2、循环任务，并组装每个任务中的数据，并保存
                for (var j = 0; j < taskOrder.length; j++) {
                    var taskSon = taskOrder[j].bljm;
                    commonPllr(taskSon, order, taskOrder);
                }

                // OfflineOrderService.saveOfflineOrder(data, order);
                lastDowloadToast(condition, 'success');
            }, function () {
                lastDowloadToast(condition, 'fail');
            });
        }

        /**
         * 跳转装拆录入界面
         * @param value 房产编号
         * @param meteNo 计量点Ary
         * @param apiData 接口返回数据
         */
        function pllrZh(value, meteNo, apiData) {
            var passInfoVo = filterOrder('infoVo', apiData, value);
            var passMcbList = filterOrder('mcbList', apiData, value);
            var passMtrList = filterOrder('mtrList', apiData, value);
            var passInduList = filterOrder('induList', apiData, value);
            var passSealList = dealLock(meteNo, apiData);// 处理锁信息
            var copyApiData = angular.copy(apiData);
            copyApiData.infoVo = passInfoVo.length > 0 ? passInfoVo[0] : {};
            copyApiData.mcbList = passMcbList;
            copyApiData.mtrList = passMtrList;
            copyApiData.induList = passInduList;
            copyApiData.sealList = passSealList;
            return copyApiData;
        }

        function filterOrder(type, apiData, premNoBz) {
            return apiData[type].filter(function (item) {
                if (item.premno === premNoBz) return true
            });
        }

        /**
         * 处理锁信息，统计计量点编号对应的锁信息
         * @param lockAry
         * @param apiData
         * @returns {Array}
         */
        function dealLock(lockAry, apiData) {
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
            zcgdOrder.dlqList = getDlq(zcxxInfo.mcbList);// 断路器信息
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
            // hyMui.loaderShow();
            azwzxxService.queryAzwzInfo(param).then(function (data) {
                // hyMui.loaderHide();
                if (data.length > 0) {
                    zcgdOrder.anwzData = data;
                }
                zhDnb(zcxxInfo.mtrList, zcgdOrder, taskList);// 电能表数据
                zhHgq(zcxxInfo.induList, zcgdOrder, taskList);// 互感器数据
            }, function () {
                zhDnb(zcxxInfo.mtrList, zcgdOrder, taskList);// 电能表数据
                zhHgq(zcxxInfo.induList, zcgdOrder, taskList);// 互感器数据
                // hyMui.loaderHide();
            });
            zhLockInfo(zcxxInfo.sealList, zcgdOrder);// 锁信息
            findTaskToChange(zcgdOrder, taskList);
            // 保存本地数据（只有基本信息和锁信息的情况）
            OfflineOrderService.saveOfflineOrder(taskList, order);
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
         * 成功/失败提示
         * @param condition
         * @param state
         */
        function lastDowloadToast(condition, state) {
            if (state === 'success') {
                // 成功数量加1
                condition.successDown++;
                if (condition.successDown + condition.failDown === condition.orderLen) {
                    hyMui.loaderHide();
                    hyMui.toast({message: '下載成功工單：' + condition.successDown + '條，下載失敗工單：' + condition.failDown + '條'});
                }
            } else if (state === 'fail') {
                condition.failDown++;
                if (condition.successDown + condition.failDown === condition.orderLen) {
                    hyMui.loaderHide();
                    hyMui.toast({message: '下載成功工單：' + condition.successDown + '條，下載失敗工單：' + condition.failDown + '條'});
                }
            }
        }

        /**
         * 保存工单公用方法
         * @param serviceAPI 服务名称
         * @param serviceSaveName 调用保存方法名称
         * @param serviceQueryName 调用查询方法名称
         * @param param 保存入参
         * @param task 工单关键信息
         * @param config 提示消息参数
         */
        function saveCommonInfo(serviceAPI, serviceSaveName, serviceQueryName, param, task, config) {
            if (config.intervalFlag) hyMui.loaderShow();
            serviceAPI[serviceSaveName](param).then(function (data) {
                if (data.rslt === '0') {
                    // 刪除此工单入参本地数据
                    OfflineParamService.delOfflineParam(task.wkordrno);
                    // 数据上传后offline标签需要移除，并且保存至本地数据库（当执行到最后一条数据时更新本地已办理缓存）
                    $scope.saveOrder.some(function (saveOrder) {
                        if (task.wkordrno.indexOf(saveOrder.wkordrno) > -1) {
                            saveOrder.offLineState = false;
                            return true;
                        }
                    });
                    // 保存成功后进行提示
                    config.successNum++;
                    if (config.successNum + config.failNum === config.listLen) {
                        hyMui.toast({message: '保存成功工單：' + config.successNum + '條，保存失敗工單：' + config.failNum + '條'});
                        $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
                        hyMui.loaderHide();
                    }

                    // 刷新离线工单本地缓存（目的：解决新增设备等数组后台返回唯一ID的问题）
                    // if (serviceQueryName instanceof Array) {
                    //     // 嵌套查询
                    //     getNestedCommonInfo(serviceAPI, serviceQueryName, task, callbackFn);
                    // } else {
                    //     getCommonInfo(serviceAPI, serviceQueryName, task, callbackFn);
                    // }
                    // 本地数据库中为空，则完成了全部工单的保存操作，提示保存成功
                    // CEM_OFFLINE_PARAM_LIST.all().list(function (results) {
                    //     if (results && results.length === 0) {
                    //         hyMui.alert('保存成功');
                    //     }
                    // });
                } else {
                    config.failNum++;
                    if (config.successNum + config.failNum === config.listLen) {
                        hyMui.toast({message: '保存成功工單：' + config.successNum + '條，保存失敗工單：' + config.failNum + '條'});
                        $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
                        hyMui.loaderHide();
                    }
                }
            }, function () {
                config.failNum++;
                if (config.successNum + config.failNum === config.listLen) {
                    hyMui.toast({message: '保存成功工單：' + config.successNum + '條，保存失敗工單：' + config.failNum + '條'});
                    $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
                    hyMui.loaderHide();
                }
            });
        }

        /**
         * 获取M+发送的消息
         */
        function getNewsMessage() {
            if (window.HYMplus) {
                if (!window.executeMplus) {
                    window.addEventListener("onMPlusMessage", onTestTransfer, false);
                    window.executeMplus = true;
                }
            }
        }

        function onTestTransfer(status) {
            var mjAry = [];
            var formName = status.formName;
            var type = status.newsType;
            var message = '';
            if (type === 'img') {
                message = '[圖片]';
            } else {
                message = status.message;
            }
            saveMjNews(status);// 消息列表保存到本地
            var msgObj = {
                id: ++yyNum,
                title: formName,
                text: message,
                foreground: true,
                at: new Date()
            };
            mjAry.unshift(msgObj);
            mjAry.length > 0 ? promptMessage(mjAry) : null;
            cancelPowerFailure(message);// 取消停電操作
        }

        /**
         * 取消停电
         * @param message
         */
        function cancelPowerFailure(message) {
            var index = message.indexOf('取消停電');
            if (index === -1) return;
            var gzdbh = message.replace(/[^0-9]/ig, "");
            var dealAry = $scope.notSaveOrder.concat($scope.saveOrder);
            var cancelOrder = null;
            var bz = dealAry.some(function (item) {
                if (item.wkordrno === gzdbh && item.wkflowstdtaskno == 779 && item.orderType !== '3') {
                    cancelOrder = item;
                    return true;
                }
            });
            if (cancelOrder && bz) {
                // 存在需要取消的工单，调用接口
                var param = {
                    "oprtr": rybs,
                    "wkordrno": cancelOrder.wkordrno
                };
                hyMui.alert('停電工單號' + gzdbh + '取消停電，地址：' + cancelOrder.equilocdescr + '，請確認', function () {
                    // hyMui.toast({message: '取消成功'});
                    // cancelOrder.orderType = '3';// 工单状态，1.已保存 2.已传递 3.已取消
                    // cancelOrder.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    // $rootScope.$broadcast("CHANGE_SAVE_ORDER", cancelOrder);
                    // $scope.$evalAsync();
                    hyMui.loaderShow();
                    tdblService.cancellingDisconnection(param).then(function (data) {
                        hyMui.loaderHide();
                        if (data.rslt === '0') {
                            hyMui.toast({message: '取消成功'});
                            cancelOrder.orderType = '3';// 工单状态，1.已保存 2.已传递 3.已取消
                            cancelOrder.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                            $rootScope.$broadcast("CHANGE_SAVE_ORDER", cancelOrder);
                            $scope.$evalAsync();
                        } else {
                            hyMui.toast({message: '取消失敗'});
                        }
                    }, function () {
                        hyMui.loaderHide();
                    })
                });
            }
        }

        /**
         * 保存M+消息列表
         * @param infoObj
         */
        function saveMjNews(infoObj) {
            var msg = '';
            if (infoObj.newsType === 'img') {
                // var timestamp = new Date().getTime();
                var imgBase64 = 'data:image/png;base64,' + infoObj.message;
                msg = new Date().getTime() + ''; // 时间戳作为图片ID
                var obj = {
                    fileId: msg,
                    base: imgBase64
                };
                PhotoService.savePhoto(obj);// 将图片保存到本地数据库
            } else {
                msg = infoObj.message
            }
            var mjObj = {
                fromName: infoObj.formName,
                message: msg,
                type: infoObj.newsType,
                fromTime: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                read: false// 是否已读 false未读 true已读
                // chatId: infoObj.chatId,
                // msgId: infoObj.msgId,
                // instanceId: infoObj.instanceId
            };
            var mjNewsAry = $hyUtil.getLocal(TFConstant.LOCAL_MJ_NEWS) || [];// 消息列表
            mjNewsAry.unshift(mjObj);
            $hyUtil.saveLocal(TFConstant.LOCAL_MJ_NEWS, mjNewsAry);
            $rootScope.$broadcast("REFRESH_MJ_NEWS", true);
        }

        /**
         * 筛选登录人可查看的菜单
         */
        function userMenus() {
            localMenus = $hyUtil.getLocal(TFConstant.LOCAL_HOME_MENUS) || [];
            var menuAry = localMenus.filter(function (item) {
                return item.rybs === rybs;
            });
            if (menuAry.length > 0) {
                showMenus = menuAry[0].menu;
            }
            var filterMenus = menus.filter(function (item) {
                return item.show;
            });
            if (filterMenus.length === showMenus.length) {
                var num = 0;
                for (var i = 0; i < filterMenus.length; i++) {
                    for (var j = 0; j < showMenus.length; j++) {
                        if (filterMenus[i].menuName === showMenus[j].menuName) {
                            // 数组一中的对象存在于数组二中
                            num++;
                        }
                    }
                }
                if (filterMenus.length !== num) {
                    showMenus = filterMenus;
                }
            } else {
                showMenus = filterMenus;
            }
            $scope.menus = showMenus;
        }

        /**
         * 移除今天零点之前工单的相关信息、消息列表
         * 与本地清除时间比较，相同则不需要清除
         */
        function clearHistoryOrder() {
            var clearDateStr = $hyUtil.getLocal(TFConstant.LOCAL_CLEAR_TIME);// 清除数据时间
            if (!clearDateStr) {
                $hyUtil.saveLocal(TFConstant.LOCAL_CLEAR_TIME, $filter('date')(new Date(), 'yyyy-MM-dd'));// 首次加载 设置清除时间
                return;
            }
            var clearDate = new Date(clearDateStr + ' 00:00:00');
            var nowTime = new Date(new Date().toLocaleDateString());
            if (nowTime.getTime() === clearDate.getTime()) return;
            clearPreviousOrders(nowTime);// 清除今天之前的工单
            clearMjNews(nowTime);
            clearRemainTime();// 清空复电剩余时间数组
            clearRemainOrder();// 清空预约工单不足一小时
            clearDropList();// 清空下拉数据
            var clearTime = $filter('date')(new Date(), 'yyyy-MM-dd');
            $hyUtil.saveLocal(TFConstant.LOCAL_CLEAR_TIME, clearTime);// 已清除过历史数据
            PassOrderService.delPassOrder(null, clearTime);// 清除传递工单本地数据库（清除今天以外的数据）
            OfflineOrderService.delOfflineOrder(null, clearTime);// 清除离线工单本地数据库（清除今天以外的数据）
        }

        function clearPreviousOrders(nowTime) {
            var orderTime = null;
            for (var i = 0; i < $scope.notSaveOrder.length; i++) {
                orderTime = new Date($scope.notSaveOrder[i].localTime);
                if (orderTime < nowTime) {
                    $scope.notSaveOrder.splice(i, 1);
                    i--;
                }
            }
            $hyUtil.saveLocal(TFConstant.LOCAL_NOT_SAVE, $scope.notSaveOrder);
            for (var j = 0; j < $scope.saveOrder.length; j++) {
                orderTime = new Date($scope.saveOrder[j].localTime);
                if (orderTime < nowTime) {
                    $scope.saveOrder.splice(j, 1);
                    j--;
                }
            }
            $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
            for (var k = 0; k < $scope.passOrder.length; k++) {
                orderTime = new Date($scope.passOrder[k].localTime);
                if (orderTime < nowTime) {
                    $scope.passOrder.splice(k, 1);
                    k--;
                }
            }
            $hyUtil.saveLocal(TFConstant.LOCAL_PASS, $scope.passOrder);
        }

        function clearMjNews(nowTimes) {
            // 清除消息列表并保存
            var mjNewsList = $hyUtil.getLocal(TFConstant.LOCAL_MJ_NEWS) || []; // 消息界面数据
            for (var m = 0; m < mjNewsList.length; m++) {
                var orderTimes = new Date(mjNewsList[m].fromTime.split(' ')[0]);
                if (orderTimes < nowTimes) {
                    if (!isNaN(mjNewsList[m].message)) {
                        PhotoService.delPhoto(mjNewsList[m].message);// 删除数据库中的照片
                    }
                    mjNewsList.splice(m, 1);
                    m--;
                }
            }
            $hyUtil.saveLocal(TFConstant.LOCAL_MJ_NEWS, mjNewsList);// 保存清除后的数据
        }

        function clearRemainTime() {
            $hyUtil.saveLocal(TFConstant.LOCAL_PROMPT_TIME, []);
        }

        function clearRemainOrder() {
            $hyUtil.saveLocal(TFConstant.LOCAL_REMINDER_WORKER, []);
        }

        function clearDropList() {
            localStorage.setItem('__WGJL_SYSCODE_DROP', JSON.stringify({}));
            // DB_SYS_DROP_CODE.all().destroyAll();
        }

        /**
         * 统计环节工单数量
         * @param hjh
         * @param list 已保存和未办理数组合并
         * @returns {number}
         */
        function countNum(hjh, list) {
            // 统计当前环节已保存和未办理的数量
            var typeList = list.filter(function (item) {
                if (hjh.indexOf(item.wkflowstdtaskno.toString()) !== -1) {
                    return item
                }
            });
            return typeList.length
        }

        /**
         * 控制工单中字段的展示
         * 现场检查：业务类别、优先级
         * 复电办理：复电剩余时间
         */
        function controlOrderTitle() {
            // 从本地获取业务下拉数据，没有则请求接口
            var ywfl = systemDropList.getDmflData('CCSBUSICATG');
            if (ywfl && ywfl.length > 0) {
                translateOrderDmfl();
            } else {
                // 构造业务类别下拉
                systemDropList.createYwlbDrop('CCS').then(function (result) {
                    if (result === 'success') {
                        translateOrderDmfl();
                    }
                });
            }
        }

        function translateOrderDmfl() {
            var orderLength = $scope.notSaveOrder.length;
            $scope.notSaveOrder.forEach(function (item, index) {
                // 计算复电剩余时间
                if (item.wkflowstdtaskno === 784 && item.arresetttm) {
                    item.incotm = item.incotm.length > 19 ? item.incotm.substring(0, 19) : item.incotm;
                    item.arresetttmMc = timeLeft(item.arresetttm);
                }
                // 翻译优先级
                if (item.wkflowstdtaskno === 1168 || item.wkflowstdtaskno === 1170 || item.wkflowstdtaskno === 9999 || item.wkflowstdtaskno === 1169 || item.wkflowstdtaskno === 1171) {
                    (function (item) {
                        item.yxjBz = true;// 控制界面显隐
                        systemDropList.getDropLable('PRTYLVLCD', item.wkprty).then(function (label) {
                            item.wkprtyMc = label || item.wkprty;
                        });
                    })(item)
                }
                // 翻译业务类别
                (function (item, index) {
                    systemDropList.getDropLable('CCSBUSICATG', item.buscatgcd).then(function (label) {
                        item.buscatgcdMc = label || item.buscatgcd;
                        if (index === orderLength - 1) {
                            // 更新本地缓存中的业务类别字段
                            $hyUtil.saveLocal(TFConstant.LOCAL_NOT_SAVE, $scope.notSaveOrder);
                        }
                    });
                })(item, index);
            });
        }

        /**
         * 复电剩余时间计算
         * @param appointmentTime
         * @param backFlag 返回数据格式标志
         */
        function timeLeft(appointmentTime, backFlag) {
            appointmentTime = appointmentTime.split('.')[0];
            var hh = '00';
            var mm = '00';
            var ss = '00';
            var preTime = new Date(appointmentTime).getTime();
            var nowTime = new Date().getTime();
            var fdTime = (nowTime - preTime) / 1000;//秒
            var remainderTime = null;
            //  fdTime<0 则剩余复电时间取4小时;fdTime>240*6000，则剩余复电时间取0小时
            if (fdTime <= 0 || fdTime === 240 * 60) {
                hh = '04';
            } else if (fdTime < 240 * 60) {
                remainderTime = Math.round(4 * 60 * 60 - fdTime);// 秒
                hh = Math.floor(remainderTime / 60 / 60).toString();// 小时
                mm = Math.floor((remainderTime - hh * 60 * 60) / 60).toString();// 分钟
                ss = Math.floor(remainderTime - hh * 60 * 60 - mm * 60).toString();// 秒
                hh = hh.length === 1 ? '0' + hh : hh;
                mm = mm.length === 1 ? '0' + mm : mm;
                ss = ss.length === 1 ? '0' + ss : ss;
            } else {
                remainderTime = 0;
            }
            if (backFlag === 'ss') {
                return remainderTime;
            } else {
                return hh + ':' + mm + ':' + ss;
            }

        }

        /**
         * 复电剩余时间本地消息提示
         */
        var remainAry = $hyUtil.getLocal(TFConstant.LOCAL_PROMPT_TIME) || [];

        function promptRemainingTime() {
            var newsIntervalAry = [];
            $scope.notSaveOrder.forEach(function (item) {
                if (item.wkflowstdtaskno === 784 && item.arresetttm) {
                    // 复电剩余时间计算
                    var remainTime = timeLeft(item.arresetttm, 'ss');
                    var message = '';
                    var remainFlag = '';
                    if (remainTime <= 0) {
                        message = '復電剩餘時間为0分鐘';
                        remainFlag = item.wkordrno + 'zero';
                    } else if (remainTime <= 900) {
                        message = '復電剩餘時間小於15分鐘';
                        remainFlag = item.wkordrno + 'fifteen';
                    } else if (remainTime <= 1800) {
                        message = '復電剩餘時間小於30分鐘';
                        remainFlag = item.wkordrno + 'thirty';
                    } else {
                        return;
                    }
                    var hasOrder = remainAry.some(function (item) {
                        return item === remainFlag;
                    });
                    if (hasOrder) return;
                    remainAry.push(remainFlag);
                    $hyUtil.saveLocal(TFConstant.LOCAL_PROMPT_TIME, remainAry);// 缓存提醒过的工单
                    var gdh = (item.wkordrno && item.wkordrno.substring(item.wkordrno.length - 6)) || '';
                    var address = item.equilocdescr ? '，地址：' + item.equilocdescr : '，地址：無';
                    var msgObj = {
                        id: ++yyNum,
                        title: item.wkflwtachnm,
                        text: gdh + '：此工單' + message + address,
                        foreground: true,
                        at: new Date()
                    };
                    newsIntervalAry.unshift(msgObj);
                }
            });
            newsIntervalAry.length > 0 ? promptMessage(newsIntervalAry, 'fd') : null;
        }

        /**
         * 本地通知新工单
         * @param newOrder
         */
        function receiveNewOrder(newOrder) {
            newOrder.forEach(function (item) {
                (function (item) {
                    systemDropList.getDropLable('CCSBUSICATG', item.buscatgcd).then(function (label) {
                        item.buscatgcdMc = label || '';
                        var gdh = (item.wkordrno && item.wkordrno.substring(item.wkordrno.length - 6)) || '此工單';
                        var textMsg = item.buscatgcdMc ? gdh + '（' + item.buscatgcdMc + '）新工單，請注意查看' : gdh + '新工單，請注意查看';
                        var msgObj = {
                            id: ++yyNum,
                            title: item.wkflwtachnm,
                            text: textMsg,
                            foreground: true,
                            at: new Date()
                        };
                        var newsIntervalAry = [];
                        newsIntervalAry.unshift(msgObj);
                        promptMessage(newsIntervalAry);
                    });
                })(item);
            });
        }

        /**
         * 按照排序规则排序
         * @param orderList
         * @returns {*[]}
         */
        function orderList(orderList) {
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
                        syTm <= reminderTime ? item.tssj = syTm : null;// 添加提醒时间
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
         * 菜单跳转相应界面
         * @param menuItem
         */
        $scope.toTargetPage = function (menuItem) {
            if (!menuItem.target) {
                synchronizeDialog.show();
                return;
            }
            // 解决首页搜索工单后，进入待办列表无法正常展示的问题
            for (var key in $scope.query) {
                if ($scope.query[key]) {
                    $scope.notSaveOrder = $hyUtil.getLocal(TFConstant.LOCAL_NOT_SAVE) || [];
                    $scope.saveOrder = $hyUtil.getLocal(TFConstant.LOCAL_SAVE) || [];
                    $scope.passOrder = $hyUtil.getLocal(TFConstant.LOCAL_PASS) || [];
                    $scope.query = {};
                    break;
                }
            }
            var data = {
                menu: menuItem,
                notSaveOrder: $scope.notSaveOrder,
                saveOrder: $scope.saveOrder,
                passOrder: $scope.passOrder
            };
            mainNavi.pushPage(menuItem.target, {
                cancelIfRunning: true,
                homeData: data
            })
        };

        /**
         * 上传本地缓存照片
         */
        function uploadYdjcPhoto() {
            var localPhoto = $hyUtil.getLocal(TFConstant.LOCAL_PHOTO_ARY) || [];
            if (localPhoto.length !== 0) {
                uploadPhoto(localPhoto, '照片上傳完成');
            }
        }

        function uploadPhoto(list, message) {
            var uploadPhotoItem = function (index) {
                index = index || 0;
                if (list.length <= index) {
                    $hyUtil.saveLocal(TFConstant.LOCAL_PHOTO_ARY, list);
                    // return;
                } else {
                    hyMui.loaderShow();
                    TaskService.uploadYjfkPicNew(list[index]).then(function (res) {
                        hyMui.loaderHide();
                        if (res instanceof Array && res.length > 0) {
                            list.splice(index, 1);
                            uploadPhotoItem(index);
                            if (index === list.length && message) {
                                hyMui.toast({message: message});
                            }
                        } else {
                            index++;
                            uploadPhotoItem(index);
                        }
                    }, function () {
                        hyMui.loaderHide();
                    });
                }

            };
            uploadPhotoItem();
        }

        /**
         * 个人待办跳转相应界面
         * @param item
         */
        $scope.toPersonOrderPage = function (item) {
            if (item.orderType === '3') {
                hyMui.alert('工單已取消，無法查看');
                return;
            }
            var task = {
                wkflwtachno: item.wkflwtachno,
                wkflowinstno: item.wkflowinstno,// 实例号？ --> 現場檢查結果錄入
                wkordrno: item.wkordrno,//工作单编号
                wkflowtaskno: item.wkflowtaskno,
                wkflowstdtaskno: item.wkflowstdtaskno,// 标准环节号
                buscatgcd: item.buscatgcd, // 业务类别
                cntracctno: item.cntracctno,// 合约账户
                orderType: item.orderType // 工单类型
            };
            if (item.wkflowstdtaskno === 144 || item.wkflowstdtaskno === 1892) {
                mainNavi.pushPage('pages/cemydzy/aqyhjcgdbl/cemydzy_aqyhgdbl.html', {
                    cancelIfRunning: true,
                    task: task,
                    order: item
                })
            } else if (item.wkflowstdtaskno === 1890) {
                mainNavi.pushPage('pages/cemydzy/aqyhfcgdbl/cemydzy_aqyhgdfcbl.html', {
                    cancelIfRunning: true,
                    task: task,
                    order: item
                })
            } else if (item.wkflowstdtaskno === 119) {
                mainNavi.pushPage('pages/cemydzy/zcgdbl/plzcxxlr/cem_plzclr.html', {
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
                mainNavi.pushPage(getTaskUrl(item), {
                    cancelIfRunning: true,
                    task: task,
                    order: item
                });
            }
        };

        function getTaskUrl(task) {
            for (var i = 0; i < menus.length; i++) {
                if (menus[i].hjh.indexOf(task.wkflowstdtaskno.toString()) !== -1) {
                    return menus[i].workUrl;
                }
            }
        }

        /**
         * Tab页切换
         * @param type
         */
        $scope.selectSortType = function (type) {
            $scope.SortType = type;// 赋值切换项
            $scope.query = {};// 重置查询条件
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
         * 本地消息提醒
         * @param messageObj
         * @param flag
         */
        function promptMessage(messageObj, flag) {
            if (messageObj.length === 0) return;
            if (window.cordova) {
                cordova.plugins.notification.local.schedule(messageObj);
            }
            if (flag === 'fd') {
                if (navigator.notification) navigator.notification.beep(3);
                var pattern = [1400, 1200, 1400, 1200, 1400, 1200];
                if (navigator) navigator.vibrate(pattern);
            }
        }

        /**
         * 搜索
         */
        $scope.queryOrder = function () {
            // 使用本地缓存数据进行筛选
            if ($scope.SortType === 0) {
                var localNotSave = $hyUtil.getLocal(TFConstant.LOCAL_NOT_SAVE) || [];
                $scope.notSaveOrder = queryBucondition(localNotSave);
            } else if ($scope.SortType === 1) {
                var localSave = $hyUtil.getLocal(TFConstant.LOCAL_SAVE) || [];
                $scope.saveOrder = queryBucondition(localSave);
            } else {
                var localPass = $hyUtil.getLocal(TFConstant.LOCAL_PASS) || [];
                $scope.passOrder = queryBucondition(localPass);
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
                        && (!$scope.query.qf || $scope.query.qf == item.areaaddr4) && (!$scope.query.ywlb || $scope.query.ywlb == item.buscatgcd) && (!$scope.query.dbh || (item.asseno && item.asseno.indexOf($scope.query.dbh) !== -1))
                        && (!$scope.query.colorVal || $scope.query.colorVal == item.colorVal) && (!$scope.query.gdh || (item.wkordrno && item.wkordrno.indexOf($scope.query.gdh) !== -1))
                });
            } else {
                return list.filter(function (item) {
                    return (!$scope.query.rwlx || $scope.query.rwlx.indexOf(item.wkflowstdtaskno.toString()) !== -1) && (!$scope.query.dz || (item.equilocdescr && item.equilocdescr.indexOf($scope.query.dz) !== -1))
                        && (!$scope.query.qf || $scope.query.qf == item.areaaddr4) && (!$scope.query.ywlb || $scope.query.ywlb == item.buscatgcd) && (!$scope.query.dbh || (item.asseno && item.asseno.indexOf($scope.query.dbh) !== -1))
                        && (!$scope.query.colorVal || $scope.query.colorVal == item.colorVal) && (!$scope.query.gdh || (item.wkordrno && item.wkordrno.indexOf($scope.query.gdh) !== -1))
                });
            }
        }

        /**
         * 定义定时器，间隔一定时间刷新未办理下的列表数据，不重新请求接口
         * 预约工单不足一小时给予本地消息通知
         * @returns {*}
         */
        function intervalList() {
            if ($scope.notSaveOrder.length > 0) {
                $scope.notSaveOrder = orderList($scope.notSaveOrder);
                var msgAry = $hyUtil.getLocal(TFConstant.LOCAL_REMINDER_WORKER) || [];// 本地通知数组
                var msgCopy = angular.copy(msgAry);
                var remindAry = [];
                for (var i = 0; i < $scope.notSaveOrder.length; i++) {
                    // 去除已经添加过的工单
                    var res = msgAry.some(function (item) {
                        return $scope.notSaveOrder[i].wkordrno === item;
                    });
                    if ($scope.notSaveOrder[i].tssj && !res) {
                        var msgObj = {
                            id: ++yyNum,
                            title: $scope.notSaveOrder[i].wkflwtachnm,
                            text: $scope.notSaveOrder[i].wkordrno + '：距離預約開始時間不足' + reminderTime + '分鐘',
                            foreground: true,
                            at: new Date()
                        };
                        remindAry.unshift(msgObj);
                        msgCopy.push($scope.notSaveOrder[i].wkordrno);
                    }
                }
                // 数量增加则发送本地通知
                remindAry.length > 0 ? promptMessage(remindAry) : null;
                $hyUtil.saveLocal(TFConstant.LOCAL_REMINDER_WORKER, msgCopy);
            }
            return intervalList;
        }

        /**
         * 根据设置中的时间，定时请求接口
         * 1.对比差别，保存数据
         * 2.更新工单数量
         * 3.发送新工单通知
         */
        function getOrderAPI() {
            // 无网络不请求接口
            if (!navigator.onLine) {
                // 复电剩余时间提醒
                promptRemainingTime();
                return;
            }
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
                    "wkflowstdtaskno": "1168;1170;1169;1171;144;1890;1892;98;1128;526;784;779;118;119;1127;2100"
                }
            };
            homeService.queryGrdbOrderList(params).then(function (data) {
                if (data.resultVo.rslt === '0') {
                    $scope.notSaveOrder = $hyUtil.getLocal(TFConstant.LOCAL_NOT_SAVE) || [];// 未保存
                    $scope.saveOrder = $hyUtil.getLocal(TFConstant.LOCAL_SAVE) || [];// 已保存
                    $scope.passOrder = $hyUtil.getLocal(TFConstant.LOCAL_PASS) || [];// 已传递
                    // 1.清空查询条件
                    $scope.query = {};
                    // 2.工单分组并返回新增工单数组
                    var newOrder = orderGrouping(data);
                    // 3.筛选停电工单并保存停电下载时间
                    var tdgdList = filterTdOrder(newOrder);
                    tdgdList.length > 0 ? homeService.saveDownloadTime(tdgdList) : null;
                    // 4.控制工单字段展示
                    controlOrderTitle();
                    // 5.未办理工单排序
                    $scope.notSaveOrder = orderList($scope.notSaveOrder);
                    // 7.复电剩余时间提醒
                    promptRemainingTime();
                    // 8.设置菜单中的任务数量
                    loadedMenu(true);
                    // 9.发送新工单本地通知
                    newOrder.length > 0 ? receiveNewOrder(newOrder) : null;
                    // 10.发送通知待办列表刷新界面数据
                    // 1)解决问题：进入待办列表后，进行了定时请求，这时点击工单进行办理，保存成功后工单无法正常移动
                    var refreshData = {
                        getApiFlag: true,
                        notSaveList: $scope.notSaveOrder,
                        saveList: $scope.saveOrder,
                        passList: $scope.passOrder
                    };
                    $rootScope.$broadcast("SAVE_ORDER_REMOVE_SUCCESS", refreshData);
                } else {
                    // $scope.menus = menus;
                    hyMui.toast({message: '獲取個人待辦失敗'})
                }
            }, function () {
                // $scope.menus = menus;
            });
        }

        /**
         * 保存成功后工单移动
         */
        $scope.$on('CHANGE_SAVE_ORDER', function (ev, item) {
            if (!item.wkordrno) return;
            // 移除未办理中的工单，并更新本地缓存
            var oldNotSaveNum = $scope.notSaveOrder.length;
            for (var i = 0; i < $scope.notSaveOrder.length; i++) {
                if ($scope.notSaveOrder[i].wkordrno === item.wkordrno) {
                    $scope.notSaveOrder.splice(i, 1);
                    i--;
                }
            }
            if ($scope.notSaveOrder.length < oldNotSaveNum) {
                // 工单减少了，则更新本地缓存
                $hyUtil.saveLocal(TFConstant.LOCAL_NOT_SAVE, $scope.notSaveOrder);
            }
            // 向已保存中添加工单（判断已保存中是否已经存在,已存在则移除再添加-->针对同一工单号不同环节的情况），并更新本地缓存
            $scope.saveOrder.some(function (value, index) {
                if (value.wkordrno === item.wkordrno) {
                    $scope.saveOrder.splice(index, 1);
                    return true;
                }
            });
            $scope.saveOrder.unshift(item);
            $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
            $rootScope.$broadcast("SAVE_ORDER_REMOVE_SUCCESS", null);
        });

        /**
         * 传递成功后工单移动
         */
        $scope.$on('CHANGE_PASS_ORDER', function (ev, item) {
            if (!item.wkordrno) return;
            // 移除已保存中的工单，并更新本地缓存
            for (var i = 0; i < $scope.saveOrder.length; i++) {
                if ($scope.saveOrder[i].wkordrno === item.wkordrno) {
                    $scope.saveOrder.splice(i, 1);
                    i--;
                }
            }
            $hyUtil.saveLocal(TFConstant.LOCAL_SAVE, $scope.saveOrder);
            // 向已传递中添加工单（判断已传递中是否已经存在,已存在则移除再添加），并更新本地缓存
            $scope.passOrder.some(function (value, index) {
                if (value.wkordrno === item.wkordrno) {
                    $scope.passOrder.splice(index, 1);
                    return true;
                }
            });
            $scope.passOrder.unshift(item);
            $hyUtil.saveLocal(TFConstant.LOCAL_PASS, $scope.passOrder);
            $rootScope.$broadcast("SAVE_ORDER_REMOVE_SUCCESS", null);
            // 设置菜单中的任务数量
            var countOrderList = $scope.notSaveOrder.concat($scope.saveOrder);// 统计工单数量数组
            menus.forEach(function (item) {
                // 臨時檢定數量需特殊統計
                item.num = countNum(item.hjh, countOrderList);
            });
            // 刷新菜单
            refreshMenus(!$scope.moreFlag, countOrderList);
        });

        /**
         *  离开首页
         */
        $scope.$on('$destroy', function () {
            $interval.cancel(getOrderAPITask);
            getOrderAPITask = null;
            $interval.cancel(intervalTask);
            intervalTask = null;
            $interval.cancel(remainingTask);
            remainingTask = null;
            $interval.cancel(synchronizeTask);
            synchronizeTask = null;
            $interval.cancel(synLocationTask);
            synLocationTask = null;
        });

        $scope.pullDownOption = {
            content: "下拉刷新",
            downContent: "下拉刷新",
            upContent: "鬆開刷新",
            loadingContent: "<div><i class='fa fa-spinner pull-load-icon'></i></div>"
        };

        $scope.pullDownLoad = function ($done) {
            if (!navigator.onLine) {
                // 复电提醒
                promptRemainingTime();
                $done();
                return;
            }
            $scope.notSaveOrder = $hyUtil.getLocal(TFConstant.LOCAL_NOT_SAVE) || [];// 未保存
            $scope.saveOrder = $hyUtil.getLocal(TFConstant.LOCAL_SAVE) || [];// 已保存
            $scope.passOrder = $hyUtil.getLocal(TFConstant.LOCAL_PASS) || [];// 已传递
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
                    "wkflowstdtaskno": "1168;1170;1169;1171;144;1890;1892;98;1128;526;784;779;118;119;1127;2100"
                }
            };
            hyMui.loaderShow();
            homeService.queryGrdbOrderList(params).then(function (data) {
                hyMui.loaderHide();
                if (data.resultVo.rslt === '0') {
                    // 1.清空查询条件
                    $scope.query = {};
                    // 2.工单分组并返回新增工单数组
                    var newOrder = orderGrouping(data);
                    // 3.筛选停电工单并保存停电下载时间
                    var tdgdList = filterTdOrder(newOrder);
                    tdgdList.length > 0 ? homeService.saveDownloadTime(tdgdList) : null;
                    // 4.控制工单字段展示
                    controlOrderTitle();
                    // 5.未办理工单排序
                    $scope.notSaveOrder = orderList($scope.notSaveOrder);
                    // 6.复电剩余时间提醒
                    promptRemainingTime();
                    // 7.设置菜单中的任务数量
                    loadedMenu(true);
                    // 8.发送新工单本地通知
                    newOrder.length > 0 ? receiveNewOrder(newOrder) : null;
                } else {
                    $scope.menus = menus;
                    hyMui.toast({message: '獲取個人待辦失敗'})
                }
                $done();
            }, function () {
                $scope.menus = menus;
                $done();
                hyMui.loaderHide();
            });
        };

        /**
         * 翻译业务类别
         * @param dbbm
         * @returns {string}
         */
        function translateDmfl(dbbm) {
            var dbbmmc = '';
            $scope.ywlbDrop.some(function (item) {
                if (item.DMBM === dbbm) {
                    dbbmmc = item.DMBMMC;
                    return true;
                }
            });
            return dbbmmc;
        }

        function createOwnDrop() {
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
            }, {
                DMBMMC: "安全隱患檢查",
                DMBM: "144;1892"
            }, {
                DMBMMC: "安全隱患複查",
                DMBM: "1890"
            }, {
                DMBMMC: "裝拆辦理",
                DMBM: "118"
            }, {
                DMBMMC: "批量裝拆信息錄入",
                DMBM: "119"
            }, {
                DMBMMC: "批量裝拆鎖錄入",
                DMBM: "1127"
            }, {
                DMBMMC: "聯合檢查",
                DMBM: "1128"
            }, {
                DMBMMC: "故障處理",
                DMBM: "526"
            }, {
                DMBMMC: "復電辦理",
                DMBM: "784"
            }, {
                DMBMMC: "停電辦理",
                DMBM: "779"
            }, {
                DMBMMC: "臨時檢定",
                DMBM: "98"
            }, {
                DMBMMC: "移庫",
                DMBM: "2100"
            }];

            $scope.ywlbDrop = [{
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
            }, {
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
            }, {
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
            }, {
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
            }, {
                DMBMMC: "終止臨時供電申请",
                DMBM: "CCS-CS-06"
            }, {
                DMBMMC: "計量設備移庫",
                DMBM: "CCS-DM-26"
            }, {
                DMBMMC: "計量裝置開鎖",
                DMBM: "CCS-DM-27-01"
            }, {
                DMBMMC: "計量裝置重鎖",
                DMBM: "CCS-DM-27-02"
            }];

            $scope.ywsxDrop = [{
                DMBMMC: "現場檢查",
                DMBM: "1"
            }, {
                DMBMMC: "安全隱患檢查",
                DMBM: "2"
            }, {
                DMBMMC: "裝拆辦理",
                DMBM: "3"
            }, {
                DMBMMC: "聯合檢查",
                DMBM: "4"
            }, {
                DMBMMC: "故障處理",
                DMBM: "5"
            }, {
                DMBMMC: "復電辦理",
                DMBM: "6"
            }, {
                DMBMMC: "停電辦理",
                DMBM: "7"
            }, {
                DMBMMC: "臨時檢定",
                DMBM: "8"
            }, {
                DMBMMC: "裝拆分派",
                DMBM: "9"
            }];

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
        }

        createOwnDrop();

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
            $hyUtil.saveLocal(TFConstant.LOCAL_NOT_SAVE, $scope.notSaveOrder);
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

        /**
         * 数据同步
         */
        var initSynchronizeData = function () {
            ons.ready(function () {
                ons.createDialog('pages/common/home/synchronizeData.html', {parentScope: $scope}).then(function (dialog) {
                    synchronizeDialog = dialog;
                });
            });
        };

        initSynchronizeData();

        /**
         * 数据下载
         */
        $scope.downloadData = function () {
            synchronizeDialog.hide();
            getSystemDrop();// 构建下拉数据
            var downLoadOrder = angular.copy($scope.notSaveOrder);
            // 构建判断下载成功或失败工单数量的对象
            var condition = {
                orderLen: downLoadOrder.length,
                successDown: 0,
                failDown: 0
            };
            // var localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
            // param数据库中存在的数据不重新下载，从未办理工单中移除
            /*OfflineParamService.getOfflineParam(null, localTime).then(function (result) {
                if (result && result.length > 0) {
                    for (var i = 0; i < downLoadOrder.length; i++) {
                        for (var j = 0; j < result.length; j++) {
                            if (downLoadOrder[i].wkordrno === result[j].wkordrno) {
                                downLoadOrder.splice(i, 1);
                                i--;
                                break;
                            }
                        }
                    }
                    condition.orderLen = downLoadOrder.length;
                }
                // 移除orderInfo数据库中在未办理中已存在的工单
                for (var k = 0; k < downLoadOrder.length; k++) {
                    OfflineOrderService.delOfflineOrder(downLoadOrder[k].wkordrno);
                }
                for (var i = 0; i < downLoadOrder.length; i++) {
                    getOfflineOrderInfo(downLoadOrder[i], condition);
                }
            });*/
            // 移除orderInfo数据库中在未办理中已存在的工单
            for (var k = 0; k < downLoadOrder.length; k++) {
                OfflineOrderService.delOfflineOrder(downLoadOrder[k].wkordrno);
            }
            for (var i = 0; i < downLoadOrder.length; i++) {
                getOfflineOrderInfo(downLoadOrder[i], condition);
            }
        };

        /**
         * 数据上传
         */
        $scope.uploadData = function () {
            synchronizeDialog.hide();
            if (!navigator.onLine) {
                hyMui.toast({message: '暫無網絡'});
                return;
            }
            // 数据同步：1.保存本地数据库中的工单，保存成功之后清除
            var localTime = $hyUtil.getLocal(TFConstant.LOCAL_CLEAR_TIME) || '';
            OfflineParamService.getOfflineParam(null, localTime).then(function (result) {
                if (result && result.length > 0) {
                    forSaveOfflineOrder(result, true);
                } else {
                    hyMui.toast({message: '暫無同步數據'});
                }
            });
            // 2.保存本地缓存的照片
            uploadYdjcPhoto();
        };

        /**
         * 循环调用工单保存
         * @param offlineList 工单
         * @param flag 是否显示加载loading true 显示
         */
        function forSaveOfflineOrder(offlineList, flag) {
            flag = flag || false;
            var config = {
                listLen: offlineList.length,
                successNum: 0,
                failNum: 0,
                intervalFlag: flag
            };
            for (var i = 0; i < offlineList.length; i++) {
                var hjh = offlineList[i].hjh;
                var param = JSON.parse(offlineList[i].orderInfo);
                var task = {
                    wkordrno: offlineList[i].gzdbh,
                    wkflwtachno: offlineList[i].wkflwtachno,
                    wkflowstdtaskno: hjh
                };
                switch (hjh) {
                    case '1168':
                    case '1169':
                    case '1170':
                    case '1171':
                        saveCommonInfo(xcjcService, 'saveXcjcOrderInfo', 'queryXcjcOrderInfo', param, task, config);
                        break;
                    case '144':
                    case '1892':
                        saveCommonInfo(aqyhjcService, 'saveAqyhjcOrderInfo', 'queryAqyhjcOrderInfo', param, task, config);
                        break;
                    case '1890':
                        saveCommonInfo(aqyhjcService, 'saveAqyhjcOrderInfo', 'queryAqyhfcOrderInfo', param, task, config);
                        break;
                    case '779':
                        saveCommonInfo(tdblService, 'saveTdblGzdDetails', 'queryTdblGzdDetails', param, task, config);
                        break;
                    case '784':
                        saveCommonInfo(fdblService, 'saveFdblGzdDetails', 'queryFdblGzdDetails', param, task, config);
                        break;
                    case '115':
                        saveCommonInfo(zcgdfpService, 'saveZcfpOrderInfo', 'queryZcgdfpOrderInfo', param, task, config);
                        break;
                    case '1128':
                        saveCommonInfo(lhjcService, 'saveLhjcOrderInfo', ['queryLhjcOrderInfo', 'queryLhjcLockInfo'], param, task, config);
                        break;
                    case '526':
                        saveCommonInfo(gzclService, 'saveGzclOrderInfo', 'queryGzsbOrderInfo', param, task, config);
                        break;
                    case '98':
                        saveCommonInfo(lsjdService, 'saveLsjdOrderInfo', 'queryLsjdOrderInfo', param, task, config);
                        break;
                    case '1127':
                    case '118':
                        saveCommonInfo(zcgdblsService, 'saveZcgdblOrderInfo', 'queryZcgdblOrderInfo', param, task, config);
                        break;
                    case '2100':
                        saveCommonInfo(ggsbkwService, 'savePackEquipList', 'queryPackEquipList', param, task, config);
                        break;
                }
            }
        }

        function intervalSynchronizeTask() {
            if (!navigator.onLine) {
                // hyMui.toast({message: '暫無網絡'});
                return;
            }
            // 数据同步：1.保存本地数据库中的工单，保存成功之后清除
            var localTime = $hyUtil.getLocal(TFConstant.LOCAL_CLEAR_TIME) || '';
            OfflineParamService.getOfflineParam(null, localTime).then(function (result) {
                if (result && result.length > 0) {
                    forSaveOfflineOrder(result, false);
                } else {
                    // hyMui.toast({message: '暫無同步數據'});
                }
            });
            // 2.保存本地缓存的照片
            uploadYdjcPhoto();
        }

        /**
         * 每隔10分钟定时上传经纬度
         */
        function intervalSynLocationTask() {
            if (!navigator.onLine) {
                return;
            }
            var hyGeolocationView = new HyGeolocationView();
            hyGeolocationView.location(function (result) {
                if (result) {
                    var location = result.coords;
                    var params = {
                        "oprtr": $appConfig.userInfo.RYBS,
                        "voList": [
                            {
                                "eedept": $appConfig.userInfo.GDDWBM,
                                "eeno": $appConfig.userInfo.RYBS,
                                "lati": location.latitude,
                                "long1": location.longitude,
                                "mrhtid": $appConfig.userInfo.MRHTID,
                                "mrhtno": $appConfig.userInfo.MRHTNO,
                                "mrr": $appConfig.userInfo.RYBS,
                                "psttm": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                                "remark": ""
                            }
                        ]
                    };
                    homeService.saveLocationTime(params).then(function (data) {
                        if (data && data.rslt === '0') {//成功标志
                        }
                    }, function () {
                    });
                }
            }, function () {
            });
        }

        /**
         * 查询电能表示数
         * @param itemObj
         */
        function queryRead(itemObj, doSave, sysList, zcgdOrder, fromFlag, plTask) {
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
            // hyMui.loaderShow();
            zcgdblsService.queryNewOrUpdateReadList(param).then(function (data) {
                // hyMui.loaderHide();
                doSave.successNum++;
                if (data.readingList.length > 0) {
                    var equipinfo = data.readingList[0];
                    if (equipinfo) {
                        itemObj.mnufctno = equipinfo.mnufctno; // 出厂编号
                        itemObj.manu = equipinfo.manu;// 厂家信息
                    }
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
                    if (doSave.successNum + doSave.failNum === doSave.sysLen) {
                        if (fromFlag === 'dnb') {
                            // 执行组装电能表方法
                            zcgdOrder.dnbList = combinationSbxxNew(sysList);// 电能表信息
                        }
                        if (plTask instanceof Array) {
                            findTaskToChange(zcgdOrder, plTask);// 替换作用
                            OfflineOrderService.saveOfflineOrder(plTask, zcgdOrder.order);
                        } else {
                            OfflineOrderService.saveOfflineOrder(zcgdOrder, zcgdOrder.order);
                        }
                    }
                } else {
                    itemObj.bm = [];
                    if (doSave.successNum + doSave.failNum === doSave.sysLen) {
                        if (fromFlag === 'dnb') {
                            // 执行组装电能表方法
                            zcgdOrder.dnbList = combinationSbxxNew(sysList);// 电能表信息
                        }
                        if (plTask instanceof Array) {
                            findTaskToChange(zcgdOrder, plTask);// 替换作用
                            OfflineOrderService.saveOfflineOrder(plTask, zcgdOrder.order);
                        } else {
                            OfflineOrderService.saveOfflineOrder(zcgdOrder, zcgdOrder.order);
                        }
                    }
                }
            }, function () {
                doSave.failNum++;
                // hyMui.loaderHide();
            });
        }

        function getZcgdblOfflineOrder(order, condition) {
            var wkor = {
                "wkordrno": order.wkordrno
            };
            if (condition.successDown === 0 && condition.failDown === 0) hyMui.loaderShow();
            zcgdblsService.queryZcgdblOrderInfo(wkor).then(function (data) {
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
                zcgdOrder.dlqList = getDlq(zcxxInfo.mcbList);// 断路器信息
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
                // hyMui.loaderShow();
                azwzxxService.queryAzwzInfo(param).then(function (data) {
                    // hyMui.loaderHide();
                    if (data.length > 0) {
                        zcgdOrder.anwzData = data;
                    }
                    zhDnb(zcxxInfo.mtrList, zcgdOrder);// 电能表数据
                    zhHgq(zcxxInfo.induList, zcgdOrder);// 互感器数据
                }, function () {
                    zhDnb(zcxxInfo.mtrList, zcgdOrder);// 电能表数据
                    zhHgq(zcxxInfo.induList, zcgdOrder);// 互感器数据
                    // hyMui.loaderHide();
                });
                zhLockInfo(zcxxInfo.sealList, zcgdOrder);// 锁信息
                // 保存本地数据（只有基本信息和锁信息的情况）
                OfflineOrderService.saveOfflineOrder(zcgdOrder, order);
                lastDowloadToast(condition, 'success');
            }, function () {
                lastDowloadToast(condition, 'fail');
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
            }
            return sysList;
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
         * 组合电能表数据
         * @param sysList
         * @param zcgdOrder 用于保存而构造的对象
         * @param plTask 批量装拆信息录入任务列表
         */
        function zhDnb(sysList, zcgdOrder, plTask) {
            var doFactorySave = {
                successNum: 0,// 成功调用接口次数
                failNum: 0,// 失败调用接口次数
                sysLen: sysList.length// 一共调用接口次数
            };
            // 向电能表对象中添加錶码数组
            for (var i = 0; i < sysList.length; i++) {
                sysList[i].asseno = $filter('shortenNumber')(sysList[i].asseno);// 去零
                // 以下两步操作保存是保存时需要用到的字段
                sysList[i].oprtr = rybs;
                sysList[i].wkordrno = zcgdOrder.order.wkordrno;
                sysList[i].fldtskid = zcgdOrder.zcInfo.fldtskid;
                sysList[i].ccbh = sysList[i].mnufctno;// 出厂编号（初始化可能会查询出来）
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
                    queryFactoryInf(sysList[i], null, doFactorySave, sysList, zcgdOrder, 'dnb', plTask);// 查詢厂家信息
                }
                // 增加设备参数
                getEquipmentParameter(sysList[i], doFactorySave, sysList, zcgdOrder, 'dnb', plTask);
            }
        }

        /**
         * 组合互感器数据
         * @param sysList
         * @param zcgdOrder 用于保存而构造的对象
         * @param plTask 批量装拆任务列表
         */
        function zhHgq(sysList, zcgdOrder, plTask) {
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
                getEquipmentParameter(sysList[i], doSave, sysList, zcgdOrder, 'hgq', plTask);
            }
        }

        /**
         * 组合锁信息
         * @param sysList
         * @param zcgdOrder 用于保存而构造的对象
         */
        function zhLockInfo(sysList, zcgdOrder) {
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
        function queryFactoryInf(item, callback, doSave, sysList, zcgdOrder, fromFlag, plTask) {
            var doSaveFlag = true;
            // 组装电能表并保存
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
                        queryRead(itemse, doSave, sysList, zcgdOrder, 'dnb', plTask);
                    }
                    if (readBegin && readBegin.asseno && (!itemse.bm || itemse.bm.length === 0)) {
                        doSaveFlag = false;
                        queryRead(readBegin, doSave, sysList, zcgdOrder, 'dnb', plTask);
                    }
                }
            } else if (fromFlag === 'hgq') {
                // 执行组装电能表方法
                zcgdOrder.hgqList = combinationSbxxNew(sysList);// 互感器信息
            }
            if (plTask instanceof Array) {
                findTaskToChange(zcgdOrder, plTask);// 替换作用
                doSaveFlag ? OfflineOrderService.saveOfflineOrder(plTask, zcgdOrder.order) : null;
            } else {
                doSaveFlag ? OfflineOrderService.saveOfflineOrder(zcgdOrder, zcgdOrder.order) : null;
            }
        }

        /**
         * 增加设备参数
         * @param item
         * @param doSave 用于判断接口执行次数
         * @param sysList 电能表/互感器List
         * @param zcgdOrder 用于保存的组装对象
         * @param fromFlag 来源：电能表/互感器
         */
        function getEquipmentParameter(item, doSave, sysList, zcgdOrder, fromFlag, plTask) {
            var param = {
                "equiptypVo": {
                    "equiclas": item.equiclas,
                    "equityp": item.equityp
                }
            };
            // hyMui.loaderShow();
            zcgdblsService.queryEquipmentParameter(param).then(function (data) {
                // hyMui.loaderHide();
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
                                queryRead(itemse, doSave, sysList, zcgdOrder, 'dnb', plTask);
                            }
                            if (readBegin && readBegin.asseno && (!itemse.bm || itemse.bm.length === 0)) {
                                doSaveFlag = false;
                                queryRead(readBegin, doSave, sysList, zcgdOrder, 'dnb', plTask);
                            }
                        }
                    } else if (fromFlag === 'hgq') {
                        // 执行组装互感器方法
                        zcgdOrder.hgqList = combinationSbxxNew(sysList);// 电能表信息
                    }
                    if (plTask instanceof Array) {
                        findTaskToChange(zcgdOrder, plTask);// 替换作用
                        doSaveFlag ? OfflineOrderService.saveOfflineOrder(plTask, zcgdOrder.order) : null;
                    } else {
                        doSaveFlag ? OfflineOrderService.saveOfflineOrder(zcgdOrder, zcgdOrder.order) : null;
                    }
                }
            }, function () {
                doSave.failNum++;
                // hyMui.loaderHide();
            });
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

    }]);