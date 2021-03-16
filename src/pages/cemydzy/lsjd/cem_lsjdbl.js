/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/12
 * 臨時檢定辦理
 */
app.controller("cemlsjdCtrl", ['$scope', '$onsen', 'TaskService', '$appConfig', '$filter', 'lsjdService', 'ToolService', 'systemDropList', '$rootScope', 'PassOrderService', 'OrderCommonService', 'OfflineOrderService', 'OfflineParamService', 'OrderMapService',
    function ($scope, $onsen, TaskService, $appConfig, $filter, lsjdService, ToolService, systemDropList, $rootScope, PassOrderService, OrderCommonService, OfflineOrderService, OfflineParamService, OrderMapService) {
        var task = mainNavi.getCurrentPage().options.task || {};//工单号、环节号，作为入参
        var order = mainNavi.getCurrentPage().options.order || {};//工单信息，用于广播
        var rybs = $appConfig.userInfo.RYBS;
        var saveFlag = false;// 保存成功后变为true
        var ybfqmbz = '';// 驗錶費簽名標識
        var saveZc = false;// 装拆数据是否保存
        $scope.orderType = order.orderType;
        $scope.lsjdInfo = {};
        $scope.flag = false;// 默认显示中
        $scope.languageSrc = 'img/cem/db/chines.png'; // 默認中文圖標顯示
        $scope.zclu = false;// 錄入臨時裝拆數據默認不可見
        $scope.jcxmList = [];// 系统中的檢查項目
        $scope.sbList = [];// 系统中的設備列表
        $scope.xzxmList = [];// 新增的檢查項目
        $scope.xzsbList = [];// 新增的设备列表
        var delXtSbList = [];// 删除系统中的设备列表
        var delXtXmList = [];// 删除系统中检查项目列表

        systemDropList.getDropInfoList('EQUITSTITMCD');// 检查项目 （便于离线操作）

        /* 临时检定设备检查功能：
            （1）接口返回系统中存在的设备列表、检查项目列表
                a.根据设备清单标识关联
                b.在初始化时赋值，系统请求下来的数据changeflag赋值为2（修改）；翻译字段
            （2）新增的设备列表、检查项目列表
                a.根据资产编号关联
                b.在接收广播时changeflag已经赋值为1（新增）
            （3）进入项目检查界面：
                a.系统返回的检查：传递参数有系统设备对象、系统检查数组，接收后根据设备清单标识关联
                b.新增的检查：传递参数有新增的设备对象、新增的检查数组，接收后根据资产编号关联
            （4）删除的情况
                a.系统的删除：修改changeflag为3
                b.新增的删除：前台删除
        */

        function init(flag) {
            initData();
            // 传递工单从本地数据库查询
            if ($scope.orderType === '2') {
                PassOrderService.getPassOrder(order.wkordrno + "lsjd").then(function (result) {
                    if (result && result.orderInfo) {
                        var orderInfo = JSON.parse(result.orderInfo);
                        $scope.lsjdInfo = orderInfo.lsjdInfo || {};
                        $scope.jcxmList = orderInfo.jcxmList || [];
                        $scope.sbList = orderInfo.sbList || [];
                        $scope.xzxmList = orderInfo.xzxmList || [];// 新增的檢查項目
                        $scope.xzsbList = orderInfo.xzsbList || [];// 新增的设备列表
                        $scope.zclu = $scope.lsjdInfo.zclu;// 控制装拆工单入口显隐
                    } else {
                        hyMui.alert('暫無數據');
                    }
                });
            } else {
                // 离线问题：保存失败后再次进入页面可显示上次录入数据
                // 查询param数据库，存在或者无网络时获取离线工单，不存在则调用接口
                OfflineParamService.getOfflineParam(order.wkordrno + "lsjd").then(function (result) {
                    if (result || !navigator.onLine) {
                        getLsjdOfflineOrder('local');
                    } else {
                        var param = {
                            "wkflwtachno": task.wkflwtachno,
                            "wkordrno": task.wkordrno
                        };
                        hyMui.loaderShow();
                        lsjdService.queryLsjdOrderInfo(param).then(function (data) {
                            hyMui.loaderHide();
                            dealCommonInitData(data);
                            $scope.zclu = $scope.lsjdInfo.jlzcjlcount > 0;// 控制装拆工单入口显隐
                            // 照片上传失败，保存工单信息至本地
                            if (flag === 'photoFail') {
                                saveLsjdOffline(null);
                            }
                        }, function () {
                            if (flag === 'photoFail') {
                                saveLsjdOffline(null);
                            }
                            getLsjdOfflineOrder('offline');
                            hyMui.loaderHide();
                        });
                    }
                });
            }
        }

        init();

        function getLsjdOfflineOrder(state) {
            OfflineOrderService.getOfflineOrder(order.wkordrno + "lsjd").then(function (result) {
                var successMessage = OfflineOrderService.getNetWorkMessage(state, 'success');
                var failMessage = OfflineOrderService.getNetWorkMessage(state, 'fail');
                $scope.netWorkStatus = state;// 状态：local（已保存过的）/offline（请求超时）
                if (result && result.orderInfo) {
                    var orderInfo = JSON.parse(result.orderInfo);
                    if (orderInfo.flag === 'init') {
                        // 未点击过保存的初始化
                        dealCommonInitData(orderInfo);
                        $scope.zclu = $scope.lsjdInfo.jlzcjlcount > 0;// 控制装拆工单入口显隐
                    } else {
                        // 保存过的初始化，直接复制$scope对象
                        $scope.lsjdInfo = orderInfo.lsjdInfo || {};
                        $scope.jcxmList = orderInfo.jcxmList || [];
                        $scope.sbList = orderInfo.sbList || [];
                        $scope.xzxmList = orderInfo.xzxmList || [];// 新增的檢查項目
                        $scope.xzsbList = orderInfo.xzsbList || [];// 新增的设备列表
                        $scope.zclu = $scope.lsjdInfo.zclu;// 控制装拆工单入口显隐
                    }
                    hyMui.toast({message: successMessage});
                } else {
                    hyMui.toast({message: failMessage});
                }
            });
        }

        function dealCommonInitData(data) {
            data.infoVo.asseno = $filter('shortenNumber')(data.infoVo.asseno);// 去零
            data.infoVo.cntracctno = $filter('shortenNumber')(data.infoVo.cntracctno);// 去零
            $scope.lsjdInfo = data.infoVo;// 基本信息
            $scope.lsjdInfo.selFldtsktyp = $scope.lsjdInfo.fldtsktyp;
            // creteData(data);// 测试数据（设备list、检查项目list）
            $scope.jcxmList = data.jcxmList;// 檢查項目
            $scope.sbList = data.sbList;// 設備列表
            // if(!$scope.lsjdInfo.wkpsnlno){
            $scope.lsjdInfo.wkpsnlno = rybs;// 默認當前登錄人标识
            $scope.lsjdInfo.wkpsnlnoMc = $appConfig.getUserInfo().RYMC;// 默認當前登錄人
            // 翻译任務類型
            systemDropList.getDropLable('FLDTSKTYPCD', $scope.lsjdInfo.fldtsktyp).then(function (label) {
                $scope.lsjdInfo.fldtsktypMc = label || $scope.lsjdInfo.fldtsktyp;
            });
            systemDropList.getDropLable('GISTYPECD', $scope.lsjdInfo.lowvoltequityp).then(function (label) {
                label = label || '';
                var supppntno = $scope.lsjdInfo.supppntno || '';
                $scope.lsjdInfo.supppntno = label + supppntno;
            });
            // }
            for (var i = 0; i < $scope.sbList.length; i++) {
                // 系统中的设备 changeflag 赋值为2（修改）
                $scope.sbList[i].changeflag = '2';
                $scope.sbList[i].asseno = $filter('shortenNumber')($scope.sbList[i].asseno);// 去零
                (function (i) {
                    // 翻译设备类别
                    systemDropList.getDropLable('EQUICLASCD', $scope.sbList[i].equiclas).then(function (label) {
                        $scope.sbList[i].equiclasMc = label || $scope.sbList[i].equiclas;
                    });
                    // 翻译设备类型
                    systemDropList.getDropLable('EQUITYPCD', $scope.sbList[i].equityp).then(function (label) {
                        $scope.sbList[i].equitypMc = label || $scope.sbList[i].equityp;
                    });
                }(i));
            }
            // 翻译訂定功率
            systemDropList.getDropLable('LOADCODECD', $scope.lsjdInfo.subsdema).then(function (label) {
                $scope.lsjdInfo.subsdemaMc = label || $scope.lsjdInfo.subsdema;
            });
        }

        /**
         * 跳转到检查项目界面：分新增数据跳转、系统数据跳转
         * @param item 设备对象
         * @param index 用于修改检查项目界面的标题
         * @param flag 系统或新增标记
         */
        $scope.checkXm = function (item, index, flag) {
            var jcxmList = null;
            if (flag === 'xz') {
                jcxmList = $scope.xzxmList;
            } else if (flag === 'xt') {
                jcxmList = $scope.jcxmList;
            }
            var param = {
                item: item,
                index: index,// 现场任务类型编码 fldtsktyp
                jcxmList: jcxmList,
                flag: flag // 新增 系统
            };
            mainNavi.pushPage('pages/cemydzy/lsjd/cem_jcxm.html', {
                cancelIfRunning: true,
                param: param
            })
        };

        /**
         * 检查项目内容填写
         */
        /*$scope.$on('CEMJCXM_JCXM', function (ev, item) {
            for (var i = 0; i < $scope.sbList.length; i++) {
                // 查找资产编号相同的item，并重新赋值
                if ($scope.sbList[i].ZCBH === item.ZCBH) {
                    $scope.sbList[i] = item;
                }
            }
        });*/

        /**
         * 检查项目添加新的检查项目
         * @returns {boolean}
         */
        $scope.AddXm = function () {
            var param = {
                cntracctno: $scope.lsjdInfo.cntracctno,
                wkordrno: task.wkordrno
            };
            mainNavi.pushPage('pages/cemydzy/lsjd/cem_xzjcxm.html', {
                cancelIfRunning: true,
                task: param
            })
        };

        /**
         * 接收新的检查设备
         * 根据资产编号关联
         */
        $scope.$on('CEMJCXM_XCSB', function (ev, item) {
            // 判断设备列表是否重复，并添加设备
            var content = '';
            if (item.sb.length > 0) {
                for (var i = 0; i < item.sb.length; i++) {
                    if ($scope.xzsbList.length > 0) {
                        var res = $scope.xzsbList.some(function (jcsb) {
                            return jcsb.asseno === item.sb[i].asseno;
                        });
                        if (!res) {
                            $scope.xzsbList.unshift(item.sb[i]);
                            // 新增检查项目list拼接（对于新增的检查项目，没有mtfidinspconcluid equiplstid这两个字段，非必传）
                            $scope.xzxmList = $scope.xzxmList.concat(item.jcxm);
                        } else {
                            content += item.sb[i].asseno + ',';
                        }
                    } else {
                        var xtres = $scope.sbList.some(function (jcsbs) {
                            return jcsbs.asseno === item.sb[i].asseno;
                        });
                        if (xtres) {
                            content += item.sb[i].asseno + ',';
                        } else {
                            $scope.xzsbList.unshift(item.sb[i]);
                            // 新增检查项目list拼接（对于新增的检查项目，没有mtfidinspconcluid equiplstid这两个字段，非必传）
                            $scope.xzxmList = $scope.xzxmList.concat(item.jcxm);
                        }
                    }
                }
            }
            var result = content.substring(0, content.length - 1);
            if (result) {
                hyMui.alert(result + '設備已存在')
            }
        });

        /**
         * 删除系统检查项目
         * @returns {boolean}
         */
        $scope.delJcsb = function (index) {
            $scope.sbList[index].changeflag = '3';// 变更标志
            delXtSbList.push($scope.sbList[index]);// 收集删除的数据，保存时使用
            // 删除对应的检查项目
            for (var i = 0; i < $scope.jcxmList.length; i++) {
                if ($scope.sbList[index].equiplstid === $scope.jcxmList[i].equiplstid) {
                    if ($scope.jcxmList[i].mtfidinspconcluid) {
                        delXtXmList.push($scope.jcxmList[i]);
                    }
                    $scope.jcxmList.splice(i, 1);
                    i--;
                }
            }
            $scope.sbList.splice(index, 1);
        };

        /**
         * 删除新增检查项目
         * @returns {boolean}
         */
        $scope.delXzJcsb = function (index) {
            // 删除对应的检查项目
            for (var i = 0; i < $scope.xzxmList.length; i++) {
                if ($scope.xzsbList[index].asseno === $scope.xzxmList[i].asseno) {
                    $scope.xzxmList.splice(i, 1);
                    i--;
                }
            }
            $scope.xzsbList.splice(index, 1);
        };

        /**
         * 跳转验标费表单签名界面
         */
        $scope.toYbfqm = function () {
            mainNavi.pushPage('pages/cemydzy/lsjd/cemydzy_ybf.html', {
                data: $scope.lsjdInfo,
                cancelIfRunning: true,
                orderType: order.orderType // 工单状态，2 已传递则无法保存
            })
        };

        /**
         * 接收驗錶費
         */
        $scope.$on('CEMYDZY_YBF', function (ev, value) {
            ybfqmbz = value;
        });

        /**
         * 跳转装拆信息处理
         */
        $scope.toLrlszc = function () {
            var pageData = {
                lsjdInfo: $scope.lsjdInfo,
                jcxmList: $scope.jcxmList,
                sbList: $scope.sbList,
                xzxmList: $scope.xzxmList,
                xzsbList: $scope.xzsbList
            };
            mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                cancelIfRunning: true,
                task: task,
                order: order,
                fromPage: 'lsjd',
                lsjdOrderType: $scope.orderType === '2' ? true : false,
                lsjdPageData: pageData, // 临时检定界面数据
                lsjdPhoto: photoKey
            })
        };

        /**
         * 保存方法
         */
        $scope.save = function () {
            if (!$scope.lsjdInfo.tsksts) {
                hyMui.alert('請填寫檢查結果');
                return
            }
            //如果现场任务类型为现场检验，并且選擇的檢查結果不是取消则必须进行验表费签名，其他不强制；
            if ($scope.lsjdInfo.fldtsktyp === '08' && $scope.lsjdInfo.tsksts != '02' && ybfqmbz !== 'success') {
                hyMui.alert('請進行驗錶費簽名');
                return
            }
            // 需要保存的字段有 預約信息 檢查信息 檢查項目 拍照上傳 表單簽名
            var sbUploadList = delXtSbList.concat($scope.sbList).concat($scope.xzsbList);// 组合系统和新增的设备列表
            var jcxmUploadList = delXtXmList.concat($scope.jcxmList).concat($scope.xzxmList);// 组合系统和新增的检查项目列表
            if (sbUploadList.length == 0) {
                hyMui.alert('請添加檢查設備');
                return
            }
            // 设备检查数组中添加 fldtskid
            jcxmUploadList.forEach(function (item) {
                item.fldtskid = $scope.lsjdInfo.fldtskid;// 现场任务标识
            });
            // 处理设备清单数组,缺少 现场检验记录标识MTRFLDINSPRECID---> 结论：取 98
            sbUploadList.forEach(function (item) {
                item.asseno = $filter('lengthenNumber')(18, item.asseno);
                item.fldtskid = $scope.lsjdInfo.fldtskid;// 现场任务标识
                item.insp = $scope.lsjdInfo.wkpsnlno;// 检查负责人
                item.mtrfldinsprecid = '';// 现场检验记录标识
                item.fldinspdt = item.tskfnshdt || $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');// 檢查日期（查询与保存的字段名字不一样）
            });
            var zcbh = checkSbJcjg();
            if (zcbh) {
                hyMui.alert('資產編號為' + zcbh + '的設備未選擇檢查結果');
                return;
            }
            for (var i = 0; i < jcxmUploadList.length; i++) {
                if (!jcxmUploadList[i].chkitmconc) {
                    hyMui.alert('存在未選擇的檢查項目結論，請選擇');
                    return
                }
            }

            var param = {
                // 注意：入参中缺少 检查信息模块中的检查结果；工作流信息中的计量点编号；设备列表中的现场检验记录标识、是否更换
                "svfldinspinfo": {
                    "fldtskid": $scope.lsjdInfo.fldtskid,
                    "metepntno": $scope.lsjdInfo.metepntno,// 计量点编号,已添加
                    "oprtr": rybs,
                    "wkflowtaskno": task.wkflowtaskno,// 工作流实例中的任务编号
                    "wkordrno": $scope.lsjdInfo.wkordrno,
                    "tskfnshdt": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    "tskhndlsituat": "",
                    "tsksts": $scope.lsjdInfo.tsksts,
                    "fldtsktyp":$scope.lsjdInfo.selFldtsktyp
                },
                "svfldinspmtrconcinfoList": jcxmUploadList,
                "tmpverfcequipdetlList": sbUploadList

                /*[
                    {
                        "asseno": $scope.lsjdInfo.asseno,
                        "changeflag": $scope.lsjdInfo.changeflag,//變更標誌（新增：1；修改：2；刪除：3）
                        "equiclas": $scope.lsjdInfo.equiclas,
                        "equiplstid": $scope.lsjdInfo.equiplstid,
                        "fldinspcmt": $scope.lsjdInfo.wkordrno,
                        "fldinspconc": $scope.lsjdInfo.wkordrno,
                        "fldinspdt": $scope.lsjdInfo.wkordrno,
                        "fldinsphandmeth": $scope.lsjdInfo.wkordrno,
                        "fldtskid": $scope.lsjdInfo.wkordrno,
                        "insp": $scope.lsjdInfo.wkordrno,
                        "mtrfldinsprecid": $scope.lsjdInfo.wkordrno
                    }
                ]*/
            };
            //预约信息允许为空
            if ($scope.lsjdInfo.apptbegtm && $scope.lsjdInfo.apptendtm && $scope.lsjdInfo.ctctpers && $scope.lsjdInfo.wkordrtele) {
                if (ToolService.isTimeBefore($scope.lsjdInfo.apptbegtm, $scope.lsjdInfo.apptendtm)) {
                    hyMui.alert('預約結束時間不能小於預約開始時間');
                    return;
                }
                if (isPhone() == false) {
                    hyMui.alert("請輸入數字類型的預約電話");
                    return;
                }
                param.sevappt = {
                    "apptbegtm": $scope.lsjdInfo.apptbegtm,
                    "apptendtm": $scope.lsjdInfo.apptendtm,
                    "apptrec": '',// 预约内容记录
                    "cntracctno": $filter('lengthenNumber')(12, $scope.lsjdInfo.cntracctno),
                    "ctctpers": $scope.lsjdInfo.ctctpers,
                    "sevapptid": $scope.lsjdInfo.sevapptid,// 服务预约唯一标识
                    "wkordrno": $scope.lsjdInfo.wkordrno,
                    "wkordrtele": $scope.lsjdInfo.wkordrtele
                };
            } else {
                param.sevappt = null;
            }
            if (!navigator.onLine) {
                saveLsjdOffline(param);
                return;
            }
            hyMui.loaderShow();
            lsjdService.saveLsjdOrderInfo(param).then(function (data) {
                // hyMui.loaderHide();
                if (data.rslt === '0') {
                    // 保存成功后，只要存在 FLDINSPCONC 现场检验结论为不合格00 或者 结论为合格01并且 FLDINSPHANDMETH 等于02或03,将录入装拆数据显示出来，否则隐藏
                    var successList = $scope.sbList.concat($scope.xzsbList);
                    $scope.zclu = successList.some(function (item) {
                        return item.fldinspconc === '00' || (item.fldinspconc === '01' && (item.fldinsphandmeth === '02' || item.fldinsphandmeth === '03'));
                    });
                    $scope.lsjdInfo.zclu = $scope.zclu;//如果工单有网初始化jlzcjlcount==0，则需要更新装拆入口标志，针对无网保存的
                    //放到清除數據前面，否則緩存里的數據都是空的
                    var orderInfo = {
                        lsjdInfo: $scope.lsjdInfo,
                        jcxmList: $scope.jcxmList,
                        sbList: $scope.sbList,
                        xzxmList: $scope.xzxmList,
                        xzsbList: $scope.xzsbList
                    };
                    // 清除界面中的数据，之后初始化
                    $scope.jcxmList = [];// 系统中的檢查項目
                    $scope.sbList = [];// 系统中的設備列表
                    $scope.xzxmList = [];// 新增的檢查項目
                    $scope.xzsbList = [];// 新增的设备列表
                    delXtSbList = [];// 删除系统中的设备列表
                    delXtXmList = [];// 删除系统中的检查项目列表
                    saveFlag = true;
                    order.orderType = '1';// 工单状态，1.已保存 2.已传递
                    order.offLineState = false;// 非离线工单
                    order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                    // 本地緩存传递工单数据
                    PassOrderService.savePassOrder(orderInfo, order, "lsjd");
                    // 刪除此工单入参本地数据（目的为了初始化查询离线数据）
                    OfflineParamService.delOfflineParam(task.wkordrno + "lsjd");
                    //上传照片
                    TaskService.uploadYjfkPicNew(photoKey).then(function (res) {
                        hyMui.loaderHide();
                        // 删除装拆工单数据和入参数据
                        OfflineParamService.delOfflineParam(task.wkordrno);
                        OfflineOrderService.delOfflineOrder(task.wkordrno);
                        if (!$scope.zclu || saveZc) {
                            hyMui.alert("保存成功");
                        } else {
                            toZcxxluPage();// 控制装拆信息录入显隐
                        }
                        init();
                    }, function () {
                        hyMui.loaderHide();
                        init('photoFail');
                        hyMui.alert('圖片上傳中斷');
                    });
                } else {
                    hyMui.loaderHide();
                    var message = data.rsltinfo && data.rsltinfo.indexOf('Save failure') < 0 ? data.rsltinfo + ",請點擊傳遞按鈕" : "保存失敗";
                    hyMui.alert(message);
                    if (message !== '保存失敗') {
                        // 保存成功后，只要存在 FLDINSPCONC 现场检验结论为不合格00 或者 结论为合格01并且 FLDINSPHANDMETH 等于02或03,将录入装拆数据显示出来，否则隐藏
                        var successList = $scope.sbList.concat($scope.xzsbList);
                        $scope.zclu = successList.some(function (item) {
                            return item.fldinspconc === '00' || (item.fldinspconc === '01' && (item.fldinsphandmeth === '02' || item.fldinsphandmeth === '03'));
                        });
                        $scope.lsjdInfo.zclu = $scope.zclu;//如果工单有网初始化jlzcjlcount==0，则需要更新装拆入口标志，针对无网保存的
                        //放到清除數據前面，否則緩存里的數據都是空的
                        var orderInfo = {
                            lsjdInfo: $scope.lsjdInfo,
                            jcxmList: $scope.jcxmList,
                            sbList: $scope.sbList,
                            xzxmList: $scope.xzxmList,
                            xzsbList: $scope.xzsbList
                        };
                        // 清除界面中的数据，之后初始化
                        $scope.jcxmList = [];// 系统中的檢查項目
                        $scope.sbList = [];// 系统中的設備列表
                        $scope.xzxmList = [];// 新增的檢查項目
                        $scope.xzsbList = [];// 新增的设备列表
                        delXtSbList = [];// 删除系统中的设备列表
                        delXtXmList = [];// 删除系统中的检查项目列表
                        saveFlag = true;
                        order.orderType = '1';// 工单状态，1.已保存 2.已传递
                        order.offLineState = false;// 非离线工单
                        order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                        $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
                        // 本地緩存传递工单数据
                        PassOrderService.savePassOrder(orderInfo, order, "lsjd");
                        // 刪除此工单入参本地数据（目的为了初始化查询离线数据）
                        OfflineParamService.delOfflineParam(task.wkordrno + "lsjd");
                        init();
                    }
                }
            }, function () {
                saveLsjdOffline(param);
                hyMui.loaderHide();
            });
        };

        function saveLsjdOffline(param) {
            var orderInfos = {
                lsjdInfo: $scope.lsjdInfo,
                jcxmList: $scope.jcxmList,
                sbList: $scope.sbList,
                xzxmList: $scope.xzxmList,
                xzsbList: $scope.xzsbList
            };
            // 1.界面工单信息保存至本地数据库 2.保存入参保存至本地数据库 3.緩存照片photoKey 4.工单移动
            OrderCommonService.saveOrderAndParam(orderInfos, order, param, photoKey, 'lsjd');
        }

        /**
         * 传递
         * @returns {boolean}
         */
        $scope.send = function () {
            if ($scope.zclu && !saveZc && !$scope.orderType) {
                hyMui.alert("請先保存裝拆數據信息");
                return;
            }
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
         * 判断是否展示装拆信息录入功能
         */
        function toZcxxluPage() {
            hyMui.confirm({
                title: '確認',
                message: '保存成功，是否前往錄入臨時裝拆數據？',
                buttonLabels: ['取消', '前往'],
                callback: function (i) {
                    if (i !== 1) {
                        return;
                    }
                    var pageData = {
                        lsjdInfo: $scope.lsjdInfo,
                        jcxmList: $scope.jcxmList,
                        sbList: $scope.sbList,
                        xzxmList: $scope.xzxmList,
                        xzsbList: $scope.xzsbList
                    };
                    mainNavi.pushPage('pages/cemydzy/zcgdbl/cem_zcgdbl.html', {
                        cancelIfRunning: true,
                        task: task,
                        order: order,
                        fromPage: 'lsjd',
                        lsjdOrderType: $scope.orderType === '2' ? true : false,
                        lsjdPageData: pageData, // 临时检定界面数据
                        lsjdPhoto: photoKey
                    })
                }
            });
        }

        /**
         * 检查设备检查结果是否选择
         * @returns {string}
         */
        function checkSbJcjg() {
            var successList = $scope.sbList.concat($scope.xzsbList);
            var zcbh = '';
            successList.some(function (item) {
                if (!item.fldinspconc) {
                    zcbh = item.asseno;
                    return true;
                }
            });
            return zcbh;
        }

        $scope.$on('LSJD_ZCLR_SUCCESS', function (ev, item) {
            saveZc = item;
        });

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
                position = {jd: $scope.lsjdInfo.long1, wd: $scope.lsjdInfo.lati1}
            } else {
                position = {
                    jd: order.lon,
                    wd: order.lati,
                    supppntno: $scope.lsjdInfo.supppntno,
                    lowvoltequityp: $scope.lsjdInfo.lowvoltequityp
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
        var photoKey = "lsjd" + task.wkordrno;

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
                GZDBH: $scope.lsjdInfo.wkordrno,  //计划标识
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

        /**
         * 預約電話格式校驗
         */
        function isPhone() {
            var phoneReg = /^[0-9]*$/;
            return phoneReg.test($scope.lsjdInfo.wkordrtele);
        }

        $scope.check = function () {
            if ($scope.lsjdInfo.wkordrtele) {
                if (!isPhone()) {
                    hyMui.alert("請輸入數字類型的預約電話");
                }
            }
        };

        function initData() {
            $scope.jcjgDrop = [{
                DMBMMC: "完成",
                DMBM: "01"
            }, {
                DMBMMC: "未完成",
                DMBM: "00"
            }, {
                DMBMMC: "取消",
                DMBM: "02"
            }];
            $scope.xcywlxDrop = [{
                DMBMMC: "電表檢查",
                DMBM: "05"
            }, {
                DMBMMC: "現場準確度測試",
                DMBM: "06"
            }]
        }

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