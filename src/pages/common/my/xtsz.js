/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/7
 * 系统设置
 */
app.controller('wdXtszCtrl', ['$scope', 'myService', '$appConfig', function ($scope, myService, $appConfig) {
    var configJson = $appConfig.configJson || {};
    $scope.version = configJson.appVersion;
    //关于我们
    $scope.showDetailXtsz = function () {
        mainNavi.pushPage('pages/common/my/gywm.html', {cancelIfRunning: true});
    };
    //清除数据
    // $scope.clearData = function () {
    //     // localStorage.clear();
    //     hyMui.toast({
    //         message: '清除成功'
    //     });
    // };
    //清除库表
    $scope.clearKb = function () {
        myService.clearKb().then(function () {
            hyMui.toast({
                message: '清除成功'
            });
        });
    };
    $scope.checkUpdate = function () {
        _inintHyAppUpdate();
    };
}]);
