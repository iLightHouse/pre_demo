/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/05/06
 * 查詢互感器安裝位置列表
 */
app.controller("cemCxazwzCtrl", ['$scope', 'NativeService', '$http', '$appConfig', 'TaskService', 'azwzxxService', '$filter', '$rootScope',
    function ($scope, NativeService, $http, $appConfig, TaskService, azwzxxService, $filter, $rootScope) {
        var gzdbh = mainNavi.getCurrentPage().options.gzdbh || ''; //上個頁面傳遞的工作單編號
        var addrobjno = mainNavi.getCurrentPage().options.addrobjno || ''; // 地址对象编号（用于添加保存）
        var premno = mainNavi.getCurrentPage().options.premno || ''; // 房產編號
        var offlineAzwz = mainNavi.getCurrentPage().options.offlineAzwz || []; // 离线安装位置
        $scope.query = {}; //查詢條件
        $scope.azwzList = []; //测试数据
        //初始化方法
        function init() {
            $scope.search();
        }

        /**
         * 查詢方法
         */
        $scope.search = function () {
            if (!navigator.onLine) {
                $scope.azwzList =  offlineAzwz;
                return;
            }
            hyMui.loaderShow();
            var param = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                }, "vo": {
                    "addrobjno": $scope.query.dzbh || "",//地址对象编号
                    "datacrer": gzdbh,//工单号
                    // "datacrer": '110000007360',//工单号
                    "equilocdescr": $scope.query.sbms || "",//设备位置描述
                    "equilocno": $scope.query.sbbh || ""//设备位置编号
                }
            };
            azwzxxService.queryAzwzInfo(param).then(function (data) {
                hyMui.loaderHide();
                if (data.length > 0) {
                    $scope.azwzList = data;
                }
            }, function () {
                $scope.azwzList =  offlineAzwz;
                hyMui.loaderHide();
            })
        };

        /**
         * 跳轉安裝位置頁面（新增加或修改）
         */
        $scope.toDetails = function (flag, item) {
            var azwzObj = item ? item : {addrobjno: addrobjno};
            azwzObj.premno = premno;// 添加房产编号，保存需要用到
            mainNavi.pushPage("pages/cemydzy/zcgdbl/cem_azwzxq.html", {
                flag: flag,
                data: azwzObj,
                gzdbh: gzdbh,
                cancelIfRunning: true
            })
        };

        /**
         * 确定方法  返回上个页面
         */
        $scope.sure = function () {
            $rootScope.$broadcast('AZWZXZ_CGXX', $scope.azwzList[0].equilocno);
            mainNavi.popPage();
        };

        init();
    }]);