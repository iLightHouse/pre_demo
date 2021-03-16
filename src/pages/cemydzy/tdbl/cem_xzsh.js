/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/16
 * 新增封印
 */
app.controller("cemxzfyCtrl", ['$scope', '$rootScope', 'NativeService', '$filter', '$appConfig', 'systemDropList',
    function ($scope, $rootScope, NativeService, $filter, $appConfig, systemDropList) {
        $scope.flag = mainNavi.getCurrentPage().options.flag || '';// 判断是从哪个界面传递来的 来源：停电办理('') 复电办理('fd')
        var rymc = $appConfig.getUserInfo().RYMC;
        var rybs = $appConfig.getUserInfo().RYBS;
        $scope.fyxx = {
            sealtm: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            seal: rybs,
            sealMc: rymc
        };// 封印信息

        function init() {
            initData();
        }

        init();
        /**
         * 扫一扫鎖編號
         */
        $scope.scanMeter = function () {
            NativeService.scan().then(function (data) {
                $scope.fyxx.sealno = data;
            });
        };
        /**
         * 扫一扫資產編號
         */
        $scope.scanZcbh = function () {
            NativeService.scan().then(function (data) {
                $scope.fyxx.sealasseno = data;
            });
        };
        /**
         * 将新增的封印信息添加到联合检查办理界面
         * fd 復電辦理 zc 裝拆信息錄入 else 停電辦理
         */
        $scope.confirmSs = function () {
            if (!$scope.fyxx.sealno) {
                hyMui.alert('鎖編號不能為空');
                return
            }
            if ($scope.flag === 'fd') {
                $rootScope.$broadcast("CEMJCXM_XZSHFD", $scope.fyxx);
            } else if ($scope.flag === 'zc') {
                $scope.fyxx.sealirflgcd = '10';// 变更标志
                $scope.fyxx.oprtr = rybs;// 操作人
                $scope.fyxx.sealcolo = '';// 锁颜色
                $rootScope.$broadcast("CEMJCXM_XZSHZC", $scope.fyxx);
            } else if ($scope.flag === 'lh') {
                $scope.fyxx.sealirflgcd = '10';// 变更标志
                $scope.fyxx.oprtr = rybs;// 操作人
                $scope.fyxx.sealcolo = '';// 锁颜色
                $rootScope.$broadcast("CEMJCXM_XZLHJC", $scope.fyxx);
            } else {
                $rootScope.$broadcast("CEMJCXM_XZSH", $scope.fyxx);
            }
            mainNavi.popPage();
        };


        function initData() {
            $scope.jfsbDrop = [{
                DMBMMC: "電能表",
                DMBM: "01"
            }, {
                DMBMMC: "互感器",
                DMBM: "02"
            }, {
                DMBMMC: "計量點",
                DMBM: "03"
            }];
            // 加封位置
            systemDropList.getDropInfoList('SEALLOCCD').then(function (list) {
                $scope.jfwzDrop = list || [];
            });
            if ($scope.flag === 'fd') {
                $scope.fyxx.sealuse = '04';
                $scope.fyxx.sealuseMc = '停復電封';
            } else if ($scope.flag === 'zc' || $scope.flag === 'lh') {
                $scope.fyxx.sealuse = '02';// 加封用途 默认为2
                $scope.fyxx.sealuseMc = '裝錶封';
            }
            /*$scope.jfwzDrop = [{
                DMBMMC: "電錶箱",
                DMBM: "01"
            }, {
                DMBMMC: "電錶終端蓋左",
                DMBM: "02"
            }, {
                DMBMMC: "電錶終端蓋右",
                DMBM: "03"
            }, {
                DMBMMC: "MCB",
                DMBM: "04"
            }, {
                DMBMMC: "CCL",
                DMBM: "05"
            }];*/
        }

    }]);