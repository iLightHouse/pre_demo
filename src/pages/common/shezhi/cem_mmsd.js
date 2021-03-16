/**
 * Version:1.0.0
 * Author:lxj
 * Date:2019/05/16
 * 設置
 */
app.controller("cemmmsdCtrl", ['$scope', '$onsen', '$appConfig','mmsdService',
    function ($scope, $onsen,$appConfig,mmsdService) {
    $scope.info={"dlzh":$appConfig.getUserInfo().DLZH};
    $scope.save = function(){
        // if(!$scope.info.jmm){
        //     hyMui.alert("請輸入舊密碼");
        //     return;
        // }
        if(!$scope.info.xmm){
            hyMui.alert("請輸入新密碼");
            return;
        }
        if(!$scope.info.qrmm){
            hyMui.alert("請輸入確認密碼");
            return;
        }
        if($scope.info.xmm != $scope.info.qrmm){
            hyMui.alert("新密碼和確認密碼不一致，請重新輸入");
            $scope.info.xmm = '';
            $scope.info.qrmm = '';
            return;
        }
        var inparam ={
            "loginCode":$appConfig.getUserInfo().DLZH,
            "oldPassword":$scope.info.jmm||"",
            "newPassword":$scope.info.xmm||"",
            "module":"0"
        };
        hyMui.loaderShow();
        mmsdService.savePwdInfo(inparam).then(function (data) {
            hyMui.loaderHide();
            if(data == '-1'){
                hyMui.alert("賬號不存在");
            }else if(data == '-2'){
                hyMui.alert("舊密碼不正確");
            }else if(data == '-3'){
                hyMui.alert("新密碼長度不夠");
            }else if(data == '-4'){
                hyMui.alert("新密碼過於簡單");
            }else if(data == '-5'){
                hyMui.alert("新密碼與賬號重複");
            }else if(data == '-6'){
                hyMui.alert("與舊密碼重複");
            }else if(data == '-7'){
                hyMui.alert("密碼不可更改");
            }else if(data == '-10'){
                hyMui.alert("系統操作錯誤");
            }else if(data == '0'){
                hyMui.alert("更改成功",function () {
                    mainNavi.popPage();
                });
            }
        }, function () {
            hyMui.loaderHide();
        });

    }
}]);