/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/23
 * 發送郵件
 */
app.controller("cemfsyjCtrl", ['$scope', '$http', 'xcjcService', function ($scope, $http, xcjcService) {
    var fileId = mainNavi.getCurrentPage().options.fileId || '';// pdf保存成功后返回的fileId
    var workOrderNo = mainNavi.getCurrentPage().options.workOrderNo || '';// 工单号
    $scope.email = {};

    /**
     * 校验邮件合法性
     * @param phoneNum
     * @returns {boolean}
     */
    var checkEmail = function (email) {
        if (email) {
            var isMob = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            var value = email.trim();
            if (isMob.test(value) || isMob.test(email)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };


    /**
     * 保存信息并校驗
     */
    $scope.saveTdxx = function () {
        if (!$scope.email.sjryx) {
            hyMui.alert('請填寫郵箱');
            return
        }
        if (!checkEmail($scope.email.sjryx)) {
            hyMui.alert('請填寫正確的郵箱格式');
            return
        }

        var param = {
            "paramMap": {
                "templateCode": "CCS-EMAIL-017",//固定
                "language": "ZF",//固定
                // "address": "1953343446@qq.com",
                "address": $scope.email.sjryx,
                "customerNo": "",//传空
                "contractAccountNo": "",//传空
                "FileId": fileId ? [fileId] : "",//pdf保存成功后返回的fileId
                // "workOrderNo": "1111"//工单号
                "workOrderNo": workOrderNo//工单号
            }
        };
        hyMui.loaderShow();
        xcjcService.sendEmail(param).then(function (data) {
            hyMui.loaderHide();
            if (data) {
                hyMui.alert('發送成功')
            } else {
                hyMui.alert('發送失敗')
            }
        }, function () {
            hyMui.loaderHide();
        });
    };


}]);