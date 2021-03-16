/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/13
 * 裝拆工單創建
 */
app.controller("zcgdcjCtrl", ['$scope', 'TaskService', '$appConfig', 'systemDropList', '$filter', '$hyUtil', 'ToolService', 'NativeService', 'zhfcqxService', 'OfflineOrderService', 'zcgdfpService',
    function ($scope, TaskService, $appConfig, systemDropList, $filter, $hyUtil, ToolService, NativeService, zhfcqxService, OfflineOrderService, zcgdfpService) {
        $scope.gzdbh = '';
        $scope.jbxx = {};
        $scope.yyxx = {
            'YYLXR': '',
            'YYDH': '',
            'YYKSSJ': '',
            'YYJSSJ': ''
        };//預約信息
        $scope.GZDBH = '';
        $scope.flag = false;//默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; //默認中文圖標顯示
        $scope.cjsfky = false; //创建按钮是否可用
        $scope.bcsfky = true; //保存按钮是否可用
        $scope.zcsbList = [];  //裝拆設備列表
        var saveBz = false;// 保存标志
        var passFlag = false;// 傳遞標誌

        /**
         * 初始化下拉
         * @returns
         */
        function init() {
            $scope.bgbzDrop = [{  //電能表變更標誌下拉
                DMBMMC: "更換",
                DMBM: "25"
            }, {
                DMBMMC: "拆除",
                DMBM: "15"
            }, {
                DMBMMC: "抄錶",
                DMBM: "35"
            }];
            $scope.hgqbgbzDrop = [{  //互感器變更標誌下拉
                DMBMMC: "更換",
                DMBM: "25"
            }, {
                DMBMMC: "拆除",
                DMBM: "15"
            }];

            $scope.ywlbDrop = [{  //業務類別
                DMBMMC: "設備領用及裝拆",
                DMBM: "CCS-DM-05"
            }, {
                DMBMMC: "計量裝置故障處理",
                DMBM: "CCS-DM-09"
            }];
            systemDropList.getDropInfoList('EQUITYPCD').then(function (list) {
                $scope.dnbSblxDrop = [];
                $scope.hgqSblxDrop = [];
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].SJDMBMBS === '01') {
                            $scope.dnbSblxDrop.push(list[i]);
                        } else if (list[i].SJDMBMBS === '02') {
                            $scope.hgqSblxDrop.push(list[i]);
                        }
                    }
                    // $scope.sblxDrop = list;
                }
            });
            systemDropList.getDropInfoList('IRRSNCD').then(function (list) {
                if (list) {
                    $scope.zcyyDrop = list;
                }
            });
            // 合约账户查询
            systemDropList.getDropInfoList('CONTACCTCATGCD');
            systemDropList.getDropInfoList('INDUCLASCD');
            systemDropList.getDropInfoList('EQUICLASCD');
            systemDropList.getDropInfoList('MASTANDSLAVMTRFLGCD');
        }

        init();

        /**
         * 扫一扫电表号码
         */
        $scope.scanMeter = function () {
            NativeService.scan().then(function (data) {
                $scope.jbxx.asseno = data;
                $scope.queryByDbbh();
            });
        };

        /**
         * 保存方法
         * @returns {boolean}
         */
        $scope.save = function () {
            //參數校驗
            if ($scope.zcsbList == null || $scope.zcsbList.length === 0) {
                hyMui.alert("暫無需保存的設備！");
                return;
            }
            for (var i = 0; i < $scope.zcsbList.length; i++) {
                if (!$scope.zcsbList[i].chgflg) {
                    hyMui.alert("變更標誌為必選項！");
                    return;
                }
                if (!$scope.zcsbList[i].irrsn) {
                    hyMui.alert("裝拆原因為必選項！");
                    return;
                }
                $scope.zcsbList[i].wkordrno = $scope.GZDBH;
            }
            var inparam = {
                "appirordrnovo": {
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno),
                    "oprtr": $appConfig.getUserInfo().RYBS,
                    "wkordrno": $scope.GZDBH
                },
                "list": []
            };
            var newZcsbList = [];
            for (var i = 0; i < $scope.zcsbList.length; i++) {
                //addFlag為false還沒有上傳到後台，直接新增；如果changeflag為3，是刪除標誌（已上傳到後台，後來點擊刪除）
                if (!$scope.zcsbList[i].addFlag || $scope.zcsbList[i].changeflag == '3') {
                    var newZcsb = {
                        "changeflag": $scope.zcsbList[i].changeflag || "1",
                        "chgflg": $scope.zcsbList[i].chgflg,
                        "datauniqid": $scope.zcsbList[i].datauniqid,
                        "equiclas": $scope.zcsbList[i].equiclas,
                        "equityp": $scope.zcsbList[i].equityp,
                        "irrsn": $scope.zcsbList[i].irrsn,
                        "irtaskdetlno": $scope.zcsbList[i].irtaskdetlno || "",
                        "mastandslavflg": $scope.zcsbList[i].mastandslavflg,
                        "mcbcur": "",
                        "mcbnbr": "",
                        "metepntno": $scope.zcsbList[i].metepntno,
                        "wkordrno": $scope.GZDBH
                    };
                    newZcsbList.push(newZcsb);
                }
            }
            if (newZcsbList.length === 0) {
                hyMui.alert("您已保存過，請添加或刪除設備！");
                return;
            }
            inparam.list = newZcsbList;
            hyMui.loaderShow();
            zhfcqxService.saveZcsbInfo(inparam).then(function (data) {
                hyMui.loaderHide();
                if (data && data.rslt === '0') {
                    for (var i = 0; i < $scope.zcsbList.length; i++) {
                        //刪除
                        if ($scope.zcsbList[i].changeflag == '3') {
                            $scope.zcsbList.splice(i, 1);
                            --i;
                        } else {
                            $scope.zcsbList[i].addFlag = true;
                        }
                    }
                    var dnbflag = false;
                    var hgqflag = false;
                    var condition = {
                        initNum: 0,// 当前次数
                        allNum: 0 // 调用接口总次数
                    };
                    for (var i = 0; i < $scope.zcsbList.length; i++) {
                        //判斷數組中是否存在電能表或互感器，來決定是否調用查詢裝拆記錄服務
                        if ($scope.zcsbList[i].equiclas == '01') {
                            dnbflag = true;
                        }
                        if ($scope.zcsbList[i].equiclas == '02') {
                            hgqflag = true;
                        }
                    }
                    //查詢保存成功后的裝拆記錄標識，賦值到數組中，刪除會用到
                    if (dnbflag) {
                        condition.allNum++;
                        queryDnbZcsbjlinfo(condition);
                    }
                    if (hgqflag) {
                        condition.allNum++;
                        queryHgqZcsbjlinfo(condition);
                    }
                    if (!dnbflag && !hgqflag) {
                        saveLocalOrder();// 保存本地数据
                    }
                    // hyMui.alert("保存成功");
                    // saveBz = true;// 保存成功标志
                } else {
                    //若刪除失敗，則將操作標誌由刪除還原成以前的值
                    for (var i = 0; i < $scope.zcsbList.length; i++) {
                        //刪除
                        if ($scope.zcsbList[i].changeflag == '3') {
                            $scope.zcsbList[i].changeflag = '1';
                        }
                    }
                    var mgs = "保存失敗";
                    if (data && data.rslt == '-1' && data.rsltinfo) {
                        mgs += "," + data.rsltinfo
                    }
                    hyMui.alert(mgs);
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        function saveBgSb(list) {
            var inparam = {
                "appirordrnovo": {
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno),
                    "oprtr": $appConfig.getUserInfo().RYBS,
                    "wkordrno": $scope.GZDBH
                },
                "list": []
            };
            var newZcsbList = [];
            for (var i = 0; i < list.length; i++) {
                var newZcsb = {
                    "changeflag": "2",
                    "chgflg": list[i].chgflg,
                    "datauniqid": list[i].datauniqid,
                    "equiclas": list[i].equiclas,
                    "equityp": list[i].BGHSBLX || list[i].equityp,
                    "irrsn": list[i].irrsn,
                    "irtaskdetlno": list[i].irtaskdetlno || "",
                    "mastandslavflg": list[i].mastandslavflg,
                    "mcbcur": "",
                    "mcbnbr": "",
                    "metepntno": list[i].metepntno,
                    "wkordrno": $scope.GZDBH
                };
                newZcsbList.push(newZcsb);
            }
            inparam.list = newZcsbList;
            hyMui.loaderShow();
            zhfcqxService.saveZcsbInfo(inparam).then(function (data) {
                hyMui.loaderHide();
                if (data && data.rslt === '0') {
                    hyMui.alert("保存成功");
                    saveBz = true;// 保存成功标志
                    ghSb = [];// 清空更换设备
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        var ghSb = [];// 更换设备列表

        /**
         * 查詢電能表裝拆記錄，刪除會用到irtaskdetlno裝拆記錄標識字段，所以要查詢一下保存成功后生成的標識
         */
        function queryDnbZcsbjlinfo(condition) {
            var inparam = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "vo": {
                    "wkordrno": $scope.GZDBH,
                    "premno": $scope.jbxx.premno || "",
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno) || ""
                }
            };

            hyMui.loaderShow();
            zhfcqxService.queryZcsbjl(inparam).then(function (data) {
                hyMui.loaderHide();
                condition.initNum++;
                if (data && data.voList && data.voList.length > 0) {
                    for (var i = 0; i < data.voList.length; i++) {
                        for (var j = 0; j < $scope.zcsbList.length; j++) {
                            //拆除和抄錶后的數據，將標識賦值到數組中
                            if ($scope.zcsbList[j].asseno == data.voList[i].asseno && (data.voList[i].chgflg == '15' || data.voList[i].chgflg == '35')) {
                                $scope.zcsbList[j].datauniqid = data.voList[i].datauniqid;
                                $scope.zcsbList[j].irtaskdetlno = data.voList[i].irtaskdetlno;
                            }
                            //變更后數據,運行電能表標識相等
                            if (data.voList[i].chgflg == '25' && $scope.zcsbList[j].chgflg == '25' &&
                                (data.voList[i].instdeviid == $scope.zcsbList[j].instdeviid)) {
                                $scope.zcsbList[j].datauniqid = data.voList[i].datauniqid;
                                $scope.zcsbList[j].irtaskdetlno = data.voList[i].irtaskdetlno;
                                ghSb.push($scope.zcsbList[j]);
                            }
                        }
                    }
                }
                // 最后一次调用变更设备的保存方法
                if (condition.initNum === condition.allNum) {
                    if (ghSb.length > 0) {
                        saveBgSb(ghSb);
                    }else {
                        hyMui.alert("保存成功");
                        saveBz = true;// 保存成功标志
                    }
                }
                saveLocalOrder();// 保存本地数据
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 查詢互感器裝拆記錄，刪除會用到irtaskdetlno裝拆記錄標識字段，所以要查詢一下保存成功后生成的標識
         */
        function queryHgqZcsbjlinfo(condition) {
            var inparam = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "vo": {
                    "wkordrno": $scope.GZDBH,
                    "premno": $scope.jbxx.premno || "",
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno) || ""
                }
            };

            hyMui.loaderShow();
            zhfcqxService.queryHgqZcsbjl(inparam).then(function (data) {
                hyMui.loaderHide();
                condition.initNum++;// 调用接口次数
                if (data && data.voList && data.voList.length > 0) {
                    for (var i = 0; i < data.voList.length; i++) {
                        for (var j = 0; j < $scope.zcsbList.length; j++) {
                            //拆除和抄錶后的數據，將標識賦值到數組中
                            if ($scope.zcsbList[j].asseno == data.voList[i].asseno && (data.voList[i].chgflg == '15' || data.voList[i].chgflg == '35')) {
                                $scope.zcsbList[j].datauniqid = data.voList[i].datauniqid;
                                $scope.zcsbList[j].irtaskdetlno = data.voList[i].irtaskdetlno;
                            }
                            //變更后數據,運行電能表標識相等
                            if (data.voList[i].chgflg == '25' && $scope.zcsbList[j].chgflg == '25' &&
                                (data.voList[i].instdeviid == $scope.zcsbList[j].instdeviid)) {
                                $scope.zcsbList[j].datauniqid = data.voList[i].datauniqid;
                                $scope.zcsbList[j].irtaskdetlno = data.voList[i].irtaskdetlno;
                                ghSb.push($scope.zcsbList[j]);
                            }
                        }
                    }
                }
                // 最后一次调用变更设备的保存方法
                if (condition.initNum === condition.allNum) {
                    if (ghSb.length > 0) {
                        saveBgSb(ghSb);
                    }else {
                        hyMui.alert("保存成功");
                        saveBz = true;// 保存成功标志
                    }
                }
                saveLocalOrder();// 保存本地数据
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 傳遞
         */
        $scope.pass = function () {
            if (!$scope.taskInfo) {
                hyMui.alert("請先創建工單");
                return;
            }
            if ($scope.zcsbList.length === 0 || !saveBz) {
                hyMui.alert("請先選擇裝拆設備保存");
                return;
            }
            hyMui.loaderShow();
            TaskService.passPgGzd($scope.taskInfo).then(function (data) {
                hyMui.loaderHide();
                if (data && data.rslt === '0') {
                    passFlag = true;
                    // 刪除此工单本地数据
                    OfflineOrderService.delOfflineOrder($scope.GZDBH);
                    queryZcfpInfo();
                } else {
                    hyMui.alert("傳遞失敗");
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        //查询装拆分派工单信息
        function queryZcfpInfo() {
            var param = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 10
                },
                "vo": {
                    "wkordrno": $scope.GZDBH
                }
            };
            hyMui.loaderShow();
            zcgdfpService.queryZcgdfpOrderInfo(param).then(function (data) {
                hyMui.loaderHide();
                $scope.zcfpInfo = data.zcfpVo;
                if ($scope.zcfpInfo.wkordrno) {
                    //保存装拆分派
                    saveZcfp();
                } else {
                    hyMui.alert("已傳遞到裝拆分派環節", function () {
                        mainNavi.popPage();
                    });
                }

            }, function () {
                hyMui.loaderHide();
            });
        }

        //保存装拆分派
        function saveZcfp() {
            var param = {
                "list": [
                    {
                        "apptt": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),// 任务执行日期
                        "dispdt": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),// 派工日期
                        "fldtskid": $scope.zcfpInfo.fldtskid,// 现场任务标识
                        "fldtsktyp": $scope.zcfpInfo.fldtsktyp,// 现场任务标识
                        "oprtr": $appConfig.userInfo.RYBS,
                        "wkordrno": $scope.zcfpInfo.wkordrno,// 工作单编号
                        "wkpsnlno": $appConfig.userInfo.RYBS // 裝拆人員
                    }
                ]
            };
            hyMui.loaderShow();
            zcgdfpService.saveZcfpOrderInfo(param).then(function (data) {
                hyMui.loaderHide();
                if (data.rslt === '0') {
                    zcPass();
                } else {
                    hyMui.alert("已傳遞到裝拆分派環節", function () {
                        mainNavi.popPage();
                    });
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        //正常传递
        function zcPass() {
            var taskInfo = {
                wkordrno: $scope.taskInfo.wkordrno,
                wkflowinstno: $scope.taskInfo.wkflowinstno,
                wkflowtaskno: $scope.zcfpInfo.wkflowtaskno + ""
            };
            hyMui.loaderShow();
            TaskService.passGzd(taskInfo).then(function (data) {
                hyMui.loaderHide();
                if (data && data.rslt === '0') {
                    hyMui.alert("傳遞成功", function () {
                        mainNavi.popPage();
                    });
                } else {
                    hyMui.alert("已傳遞到裝拆分派環節", function () {
                        mainNavi.popPage();
                    });
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 跳轉查詢合約賬戶或者是房產編號的頁面
         */
        $scope.toQueryInfo = function (mar) {
            if (mar === 1) {
                mainNavi.pushPage('pages/cemydzy/zhfcqx/cemydzy_hyzhcx.html', {
                    cancelIfRunning: true
                })
            } else if (mar === 2) {
                mainNavi.pushPage('pages/cemydzy/zhfcqx/cemydzy_fcxxcx.html', {
                    cancelIfRunning: true
                })
            } else if (mar === 3) {
                if (!$scope.GZDBH) {
                    hyMui.alert("還未創建新的工單！");
                    return;
                }
                mainNavi.pushPage('pages/cemydzy/zhfcqx/cemydzy_zcsbcx.html', {
                    cancelIfRunning: true,
                    fcbh: $scope.jbxx.premno,
                    jldbh: $scope.jbxx.metepntno
                })
            }
        };

        /**
         * 預約電話格式校驗
         */
        // 判断是否为手机号
        function isPhone() {
            var phoneReg = /^[0-9]*$/;
            if (phoneReg.test($scope.yyxx.YYDH)) {
                return true;
            } else {
                return false;
            }
        }

        $scope.check = function () {
            if ($scope.yyxx.YYDH) {
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                }
            }

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
         * 根据电表号码获取合约账户信息
         */
        $scope.queryByDbbh = function () {
            if (!$scope.jbxx.asseno) {
                return;
            }
            // 查询本地数据库
            getLocalOrder();
            var oldMeter = $scope.jbxx.asseno;
            var params = {
                "meterno": $filter('lengthenNumber')(18, $scope.jbxx.asseno)
            };
            hyMui.loaderShow();
            zhfcqxService.queryBasicOrder(params).then(function (data) {
                hyMui.loaderHide();
                if (!$scope.GZDBH) {
                    if (data.resultVo && data.resultVo.rslt === '0') {
                        if (!data.vo) {
                            hyMui.toast({message: '您輸入的電錶編號不存在，請重新輸入'});
                            $scope.jbxx.asseno = "";
                            return;
                        }
                        $scope.jbxx = data.vo || {};
                        $scope.jbxx.asseno = oldMeter;
                        if ($scope.jbxx.induclas) {
                            systemDropList.getDropLable('INDUCLASCD', $scope.jbxx.induclas).then(function (label) {
                                $scope.jbxx.induclasmc = label || $scope.jbxx.induclas;
                            });
                        }
                        $scope.jbxx.detaengladdr = data.vo.detaengladdr;
                        $scope.jbxx.detaaddr = data.vo.detaadd;
                    } else {
                        hyMui.toast({message: '獲取信息失敗'})
                    }
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        /**
         * 装拆工单创建
         */
        $scope.chuangJian = function () {
            $scope.jbxx.buscatgcd = 'CCS-DM-05';
            //参数校验
            if (!$scope.jbxx.asseno) {
                hyMui.alert("電錶編號不能為空");
                return;
            }
            if (!$scope.jbxx.buscatgcd) {
                hyMui.alert("業務類別不能為空");
                return;
            }
            //創建工單(調用接口創建工單   目前直接寫死)

            var inparam = {
                "appIrordrnoVo": {
                    "asseno": $filter('lengthenNumber')(18, $scope.jbxx.asseno),
                    "buscatgcd": $scope.jbxx.buscatgcd,
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno),
                    "fldtsktyp": "01",
                    "oprtr": $appConfig.getUserInfo().RYBS,
                    "premno": $scope.jbxx.premno,
                    "rema": $scope.jbxx.bz
                }
            };
            if ($scope.yyxx.YYKSSJ && $scope.yyxx.YYJSSJ && $scope.yyxx.YYLXR && $scope.yyxx.YYDH) {
                if (ToolService.isTimeBefore($scope.yyxx.YYKSSJ, $scope.yyxx.YYJSSJ)) {
                    hyMui.alert('預約結束時間不能小於預約開始時間');
                    return;
                }
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                    return;
                }
                inparam.appSevapptVo = {
                    "apptbegtm": $scope.yyxx.YYKSSJ,
                    "apptendtm": $scope.yyxx.YYJSSJ,
                    "apptrec": "",
                    "cntracctno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno),
                    "ctctpers": $scope.yyxx.YYLXR,
                    "oprtr": $appConfig.getUserInfo().RYBS,
                    "sevapptid": "",
                    "sevappttyp": "03",
                    "wkordrno": "",
                    "wkordrtele": $scope.yyxx.YYDH
                };
            }
            hyMui.loaderShow();
            zhfcqxService.saveZccjInfo(inparam).then(function (data) {
                hyMui.loaderHide();
                if (data.resultVo && data.resultVo.rslt === '0') {
                    $scope.GZDBH = data.wkordrno || "";
                    $scope.rwh = data.wkflowtaskno + "" || "";
                    $scope.slh = data.wkflowinstno || "";
                    $scope.taskInfo = {wkordrno: $scope.GZDBH, wkflowinstno: $scope.slh, wkflowtaskno: $scope.rwh};
                    saveLocalOrder();// 保存本地
                    hyMui.toast({message: '工單創建成功'});
                    $scope.cjsfky = true;
                    $scope.bcsfky = false;
                } else {
                    if (data && data.resultVo && data.resultVo.rsltinfo == 'ZTGD') {
                        hyMui.alert("電表編號存在在途工單，不允許創建新工單");
                    } else {
                        hyMui.alert("工單創建失敗");
                    }
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        /**
         * 删除已選擇的裝拆設備
         * @returns {boolean}
         */
        $scope.del = function (index) {
            //已經上傳服務器
            if ($scope.zcsbList[index].addFlag) {
                $scope.zcsbList[index].changeflag = '3';
            } else {
                $scope.zcsbList.splice(index, 1);
            }
        };
        /**
         * 接收合约账户信息
         */
        $scope.$on('YDJCCJ_HYZH', function (ev, item) {
            $scope.jbxx = item;
            getLocalOrder();
        });


        /**
         * 接收房产信息
         */
        $scope.$on('YDJCCJ_FCXX', function (ev, item) {
            $scope.jbxx = item;
            getLocalOrder();
        });

        function saveLocalOrder() {
            // 保存本地（用户不小心点击了返回键）
            var localData = {
                jbxx: $scope.jbxx,
                yyxx: $scope.yyxx,
                taskInfo: $scope.taskInfo
            };
            if ($scope.zcsbList.length > 0) {
                localData.zcsbList = $scope.zcsbList;
            }
            var order = {
                wkordrno: $scope.GZDBH,
                wkflowstdtaskno: $scope.jbxx.asseno,
                wkflwtachno: ''
            };
            OfflineOrderService.saveOfflineOrder(localData, order);
        }

        /**
         * 查询与合约账户匹配的本地工单
         */
        function getLocalOrder() {
            OfflineOrderService.getOfflineOrderByHjh($scope.jbxx.asseno).then(function (result) {
                if (result && result.length > 0) {
                    var locData = result[0];
                    var orderInfo = JSON.parse(locData.orderInfo) || {};
                    $scope.jbxx = orderInfo.jbxx || {};
                    $scope.yyxx = orderInfo.yyxx || {};
                    $scope.taskInfo = orderInfo.taskInfo || {};// 传递使用
                    $scope.GZDBH = locData.gzdbh;
                    if (orderInfo.zcsbList instanceof Array) {
                        $scope.zcsbList = orderInfo.zcsbList;
                        saveBz = true;
                    } else {
                        $scope.zcsbList = [];
                        saveBz = false;
                    }
                    $scope.cjsfky = true;// 创建按钮不可用
                    $scope.bcsfky = false;// 保存、传递可用
                } else {
                    // 无数据时工单号置为空
                    $scope.GZDBH = '';
                    $scope.yyxx = {};
                    beginTime.clearTimeButton();
                    endTime.clearTimeButton();
                    $scope.zcsbList = [];
                    saveBz = false;
                    $scope.cjsfky = false;// 创建按钮可用
                    $scope.bcsfky = true;// 保存、传递不可用
                }
            });
        }


        /**
         * 接受選擇的創拆設備列表
         */
        $scope.$on('YDJCCJ_SBXX', function (ev, item) {
            // 传递过来的为数组
            for (var i = 0; i < item.length; i++) {
                if ($scope.zcsbList.length > 0) {
                    var res = $scope.zcsbList.some(function (ccs) {
                        if (ccs.asseno === item[i].asseno) {
                            return true
                        } else {
                            return false
                        }
                    });
                    // 如果不存在资产编号相同的情况则添加，相同则继续循环
                    if (!res) {
                        item[i].BGHSBLX = item[i].equityp;
                        $scope.zcsbList.unshift(item[i]);
                    } else {
                        continue;
                    }
                } else {
                    item[i].BGHSBLX = item[i].equityp;
                    $scope.zcsbList.unshift(item[i]);
                }
            }
        });

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

        /**
         * 退出创建界面给予提示
         */
        mainNavi.on("prepop", function (event) {
            var pagelen = mainNavi.pages.length;
            if (pagelen === 2) {
                if ($scope.GZDBH) {
                    if (!passFlag) {
                        event.cancel();
                        hyMui.confirm({
                            title: '确认',
                            message: '您還未傳遞工單，是否繼續辦理？',
                            buttonLabels: ['否', '是'],
                            callback: function (index) {
                                if (index === 1) {
                                    return;
                                }
                                saveLocalOrder();// 保存数据至本地
                                mainNavi.off("prepop");
                                mainNavi.popPage();
                            }
                        });
                    } else {
                        mainNavi.off("prepop");
                    }
                }
            }
        });
    }]);