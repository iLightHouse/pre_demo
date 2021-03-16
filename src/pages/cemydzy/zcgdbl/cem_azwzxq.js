/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/05/06
 * 安裝位置詳情
 */
app.controller("cemAzwzxqCtrl", ['$scope', 'NativeService', '$http', '$appConfig', 'TaskService', 'azwzxxService', '$filter', '$rootScope', 'HyGeolocationView', 'zcgdblsService',
    function ($scope, NativeService, $http, $appConfig, TaskService, azwzxxService, $filter, $rootScope, HyGeolocationView, zcgdblsService) {
        $scope.flag = mainNavi.getCurrentPage().options.flag || '';
        $scope.jbxx = mainNavi.getCurrentPage().options.data || {};
        var gzdbh = mainNavi.getCurrentPage().options.gzdbh || {};
        $scope.sblbDrop = [{
            DMBMMC: "是",
            DMBM: "1"
        }, {
            DMBMMC: "否",
            DMBM: "0"
        }];

        /**
         * 初始化方法
         */
        function init() {
            if (!$scope.jbxx.sfgx && (!$scope.jbxx.long1 || !$scope.jbxx.lati1)) {
                if ($scope.flag == 'update') {
                    $scope.jbxx.sfgx = '1';
                }
                if ($scope.flag == 'add') {
                    initJWD();
                }
            } else {
                $scope.jd = $scope.jbxx.long1;
                $scope.wd = $scope.jbxx.lati1;
            }
        }

        init();

        /**
         * 获取当前位置坐标点
         */
        function initJWD() {
            var hyGeolocationView = new HyGeolocationView();
            hyMui.loaderShow();
            hyGeolocationView.location(function (result) {
                hyMui.loaderHide();
                if (!result) return;
                var location = result.coords;
                $scope.jbxx.long1 = location.longitude;
                $scope.jbxx.lati1 = location.latitude;
                $scope.$evalAsync();
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 新增或修改
         */
        $scope.sure = function () {
            if (!$scope.jbxx.indoinst) {
                hyMui.alert("請選擇是否房產內安裝");
                return;
            }
            if (!$scope.jbxx.extaddr) {
                hyMui.alert("請錄入補充地址");
                return;
            }
            var param = {
                "premno": $scope.jbxx.premno,//房產編號   查詢得出
                "sveqpmtloctinfoList": [
                    {
                        "addrobjno": $scope.jbxx.addrobjno, // 地址对象编号
                        "equilocno": $scope.jbxx.equilocno,
                        "extaddr": $scope.jbxx.extaddr,
                        "flr": $scope.jbxx.flr,
                        "indoinst": $scope.jbxx.indoinst,
                        "lati1": $scope.jbxx.lati1,
                        "long1": $scope.jbxx.long1,
                        "oprtr": $appConfig.userInfo.RYBS, //  操作人标识
                        "premno": $scope.jbxx.premno, //
                        "wkordrno": gzdbh  //工作单编号
                    }
                ]
            };
            hyMui.loaderShow();
            zcgdblsService.saveZcgdblOrderInfo(param).then(function (data) {
                hyMui.loaderHide();
                if (data.rslt === '0') {
                    hyMui.toast({message: '保存成功'});
                    // 保存成功，查询安装位置，并返回设备位置编号
                    if ($scope.flag === "add") {
                        var param = {
                            "pageInfo": {
                                "allPageNum": 0,
                                "allRowNum": 0,
                                "curPageNum": 1,
                                "rowOfPage": 100
                            }, "vo": {
                                "datacrer": gzdbh//工单号
                            }
                        };
                        azwzxxService.queryAzwzInfo(param).then(function (data) {
                            hyMui.loaderHide();
                            if (data.length > 0) {
                                var eqNo = data[0].equilocno;
                                //向上個頁面傳遞數據
                                $rootScope.$broadcast('AZWZXZ_CGXX', eqNo);
                                var pagelen = mainNavi.pages.length;
                                for (var i = 0; i <= 1; i++) {
                                    mainNavi.removePage(pagelen - 2);
                                }
                            } else {
                                // 查询失败
                                hyMui.alert('未查詢到相關位置')
                            }
                        }, function () {
                            hyMui.loaderHide();
                        });
                    } else {
                        $rootScope.$broadcast('AZWZXZ_CGXX', $scope.jbxx.equilocno);
                        var pagelen = mainNavi.pages.length;
                        for (var i = 0; i <= 1; i++) {
                            mainNavi.removePage(pagelen - 2);
                        }
                    }
                } else {
                    // 保存失败
                    hyMui.alert('保存失敗')
                }
            }, function () {
                hyMui.loaderHide();
            })
        };

        /**
         * 更新GPS
         */
        $scope.updateLocation = function (value) {
            // 修改
            if ($scope.flag === 'update') {
                if (value === '1') {
                    initJWD();
                } else {
                    $scope.jbxx.long1 = $scope.jd;
                    $scope.jbxx.lati1 = $scope.wd;
                }
            }
        }
    }
]);