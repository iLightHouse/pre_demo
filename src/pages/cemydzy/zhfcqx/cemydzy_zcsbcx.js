/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/13
 * 裝拆設備查詢
 */
app.controller("zcsbcxCtrl", ['$scope', 'NativeService', '$http', '$rootScope', 'systemDropList', 'zhfcqxService', '$filter',
    function ($scope, NativeService, $http, $rootScope, systemDropList, zhfcqxService, $filter) {
        var fcbh = mainNavi.getCurrentPage().options.fcbh || "";//房產編號
        var jldbh = mainNavi.getCurrentPage().options.jldbh || "";//計量點編號
        $scope.flag = false;// 是否有數據
        $scope.updown = true;// 初始化時展開
        $scope.query = {metepntno: jldbh};
        $scope.resultList = [];
        var resList = [];
        $scope.sblbDrop = [{
            DMBMMC: "電能表",
            DMBM: "01"
        }, {
            DMBMMC: "互感器",
            DMBM: "02"
        }];

        /**
         * 扫一扫資產編號
         */
        $scope.scanZcbh = function () {
            NativeService.scan().then(function (data) {
                $scope.query.asseno = data;
            });
        };

        /**
         * 初始化查詢裝拆設備信息
         */
        function init() {
            $scope.updown = false; //隱藏搜索條件
            var inparam = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "vo": {
                    "asseno": $filter('lengthenNumber')(18, $scope.query.asseno),
                    "equiclas": $scope.query.equiclas,
                    "metepntno": $scope.query.metepntno,
                    "premno": fcbh
                }
            };
            hyMui.loaderShow();
            zhfcqxService.queryZcsbInfo(inparam).then(function (data) {
                hyMui.loaderHide();
                if (data && data.voList && data.voList.length > 0) {
                    $scope.resultList = data.voList;
                    resList = data.voList;
                    $scope.updown = false;// 查询到结果关闭
                    for (var i = 0; i < data.voList.length; i++) {
                        data.voList[i].asseno = $filter('shortenNumber')(data.voList[i].asseno);
                        if (data.voList[i].equiclas) {
                            (function (i) {
                                //設備類別
                                systemDropList.getDropLable('EQUICLASCD', data.voList[i].equiclas).then(function (label) {
                                    data.voList[i].equiclasmc = label || data.voList[i].equiclas;
                                });
                            }(i));
                        }
                        if (data.voList[i].equityp) {
                            //設備類型
                            (function (i) {
                                systemDropList.getDropLable('EQUITYPCD', data.voList[i].equityp).then(function (label) {
                                    data.voList[i].equitypmc = label || data.voList[i].equityp;
                                });
                            }(i));
                        }
                        if (data.voList[i].mastandslavflg) {
                            (function (i) {
                                //主副標誌
                                systemDropList.getDropLable('MASTANDSLAVMTRFLGCD', data.voList[i].mastandslavflg).then(function (label) {
                                    data.voList[i].mastandslavflgmc = label || data.voList[i].mastandslavflg;
                                });
                            }(i));
                        }
                    }
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        init();

        $scope.queryZcxx = function () {
            $scope.resultList = resList.filter(function (item) {
                return (!$scope.query.equiclas || $scope.query.equiclas == item.equiclas) && (!$scope.query.metepntno || (item.metepntno && item.metepntno.indexOf($scope.query.metepntno) !== -1))
                    && (!$scope.query.asseno || (item.asseno && item.asseno.indexOf($scope.query.asseno) !== -1))
            });
        };

        /**
         * 已選中的設備
         */
        $scope.selected = [];
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {  //取消勾選
                list.splice(idx, 1);
            } else {        //選中
                list.push(item);
                //判斷是否第一次選擇互感器  是的話調用提示方法  提示是否選中該組的其他互感器
                if (item.equiclas === '02') {
                    var jldbh = '';// 计量点编号，以，隔开，用于选中该计量点编号下的其他互感器
                    for (var i = 0; i < $scope.selected.length; i++) {
                        if ($scope.selected[i].equiclas === '02') {
                            jldbh = $scope.selected[i].metepntno;
                            break;
                        }
                    }
                    if (jldbh.length > 0) {
                        remind(jldbh);
                    }
                }

            }
        };

        /**
         * 校驗已選中的 提醒是否需要選中該組其他設備
         */
        function remind(jld) {
            hyMui.confirm({
                title: '提示',
                message: '是否選擇該計量點下其他互感器?',
                buttonLabels: ['取消', '確定'],
                callback: function (index) {
                    if (index !== 1) {
                        return
                    }
                    //設置該組互感器的選中為選中
                    for (var i = 0; i < $scope.resultList.length; i++) {
                        if ($scope.resultList[i].equiclas == '02' && $scope.resultList[i].metepntno === jld) { //類型為2並且為同一個計量點下   為互感器
                            if ($scope.selected.indexOf($scope.resultList[i]) <= -1) {
                                $scope.selected.push($scope.resultList[i]);//將該組的剩餘互感器推送進已選中的列表
                            }
                        }
                    }
                    $scope.$apply();//手動刷新
                }
            });
        }

        /**
         * 校驗是否選中
         */
        $scope.isChecked = function (item, list) {
            return list.indexOf(item) >= 0;
        };

        /**
         * 选择設備信息到創拆工單创建界面
         * @param item
         */
        $scope.sure = function () {
            var selectList = angular.copy($scope.selected);
            $rootScope.$broadcast('YDJCCJ_SBXX', selectList);
            mainNavi.popPage();
        }
    }]);