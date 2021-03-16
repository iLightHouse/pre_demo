/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/17
 * 電力裝置技術要求單
 */
app.controller("scewmCtrl", ['$scope', '$onsen', 'xcjcService','$appConfig', '$filter', '$hyUtil', '$http',
    function ($scope, $onsen,xcjcService, $appConfig, $filter, $hyUtil, $http) {
        var fileId = mainNavi.getCurrentPage().options.fileId || '';// pdf保存成功后返回的fileId
        $scope.nr = '';
        /**
         * 初始化方法
         */
        function init() {
            if(!fileId){
                hyMui.alert("PDF文件不存在，無法生成二維碼");
                return;
            }
            var param ={
                "fileId":fileId
            };
            hyMui.loaderShow();
            xcjcService.createEwm(param).then(function (res) {
                hyMui.loaderHide();
                if (res) {//随机码{"code":200,"data":"4bc90167-a9db-4978-b5a1-e33faee53b05","message":null}
                    if(connectionType == 2){//现场环境返回的res就是随机数4bc90167-a9db-4978-b5a1-e33faee53b05，run.js里直接取的data对象里的值返回的
                        if(res.indexOf('-')>-1){
                            $scope.sr = $appConfig.appUrl +"/file/download/"+res;
                        }
                    }else{
                        if(res.data){//家里环境
                            $scope.sr = "http://172.20.195.210:8888/ccsmobile/file/download/"+res.data;
                        }
                    }
                    $scope.nr = "掃一掃上方二維碼，下載PDF文件";
                } else {
                    $scope.nr = "生成二維碼失敗";
                }
            }, function () {
                $scope.nr = "生成二維碼失敗";
                hyMui.loaderHide();
            });
        }
        init();


    }]);