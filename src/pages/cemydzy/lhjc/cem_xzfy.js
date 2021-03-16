/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/15
 * 新增封印
 */
app.controller("cemxzfysCtrl", ['$scope', '$rootScope', '$filter', '$appConfig', 'NativeService',
    function ($scope, $rootScope, $filter, $appConfig, NativeService) {
        var rybs = $appConfig.userInfo.RYBS;
        $scope.fyxx = {
            sealtm: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            seal: rybs,
            sealMc: $appConfig.getUserInfo().RYMC,
            sealcolo: '',// 锁颜色
            sealirflgcd: '1',// 变更标志，1：新装，2：拆除
            sealuse: '02'  // 加封用途： 01 检定封 02 装裱封 03 用检封 04 停复电封
        };// 封印信息

        initData();

        /**
         * 扫一扫鎖編號
         */
        $scope.scanMeter = function (flag) {
            NativeService.scan().then(function (data) {
                if (flag == 'fybh') {
                    $scope.fyxx.sealno = data;
                } else if (flag == 'zcbh') {
                    $scope.fyxx.sealasseno = data;
                }
            });
        };

        /**
         * 将新增的封印信息添加到联合检查办理界面
         */
        $scope.confirmFyxx = function () {
            if (!$scope.fyxx.sealno) {
                hyMui.alert('請填寫鎖編號');
                return
            }
            $rootScope.$broadcast("CEMJCXM_XZFY", $scope.fyxx);
            mainNavi.popPage();
        };

        function initData() {
            $scope.jfsbDrop = [{
                DMBMMC: "電能表",
                DMBM: "1"
            }, {
                DMBMMC: "互感器",
                DMBM: "2"
            }, {
                DMBMMC: "計量點",
                DMBM: "3"
            }];
            $scope.jfwzDrop = [{
                DMBMMC: "左耳封",
                DMBM: "1"
            }, {
                DMBMMC: "右耳封",
                DMBM: "2"
            }, {
                DMBMMC: "上耳封",
                DMBM: "3"
            }, {
                DMBMMC: "下耳封",
                DMBM: "4"
            }];
        }
    }]);