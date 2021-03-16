/**
 *
 * 修改密码
 *  Author: wangyingxue
 */

app.controller('xgmmCtrl', ['$scope', '$appConfig', 'TaskService','$hyUtil','$hyHttp','myService',
    function ($scope, $appConfig, TaskService,$hyUtil,$hyHttp,myService) {
        $scope.xianshi = mainNavi.getCurrentPage().options.flag;
        //确认修改密码
        $scope.mm = {
            ymm:'',
            xmm:''
        };
        $scope.queren = function () {
            app.xgmmModel.show();
            var reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{4,16}$/;
            if ( $scope.mm.ymm ==''||$scope.mm.xmm ==''){
                hyMui.toast({message: '密码不能不为空'});
                app.xgmmModel.hide();
                return;
            }
            var ymm = $hyUtil.getMD5Encrypt($scope.mm.ymm);
            var xmm = $hyUtil.getMD5Encrypt($scope.mm.xmm);
            var loginCheckCode =  appUserInfo.loginCheckCode;
            if(ymm != loginCheckCode){
                hyMui.toast({message: '原密码输入错误！'});
                app.xgmmModel.hide();
                return;
            }
            if(reg.test($scope.mm.xmm)==false){
                hyMui.toast({message: '新密码由4-16位字母、数字、特殊符号线组成！'});
                app.xgmmModel.hide();
                return;
            }
            myService.xgmm(xmm).then(function (data) {
                if(data.content && data.content.code==0){
                    app.xgmmModel.hide();
                    hyMui.alert("密码修改成功！");
                    if(!$scope.xianshi){
                        mainNavi.replacePage('main.html');
                    }else {
                        mainNavi.popPage();
                    }
                    appUserInfo.loginCheckCode =xmm;
                }
            },function () {
                app.xgmmModel.hide()
            })

        };
        // 退出登录
        $scope.tuichu = function () {
            hyMui.confirm({
                title: '确认',
                message: '要退出该账号吗?',
                buttonLabels: ['否', '是'],
                callback: function (index) {
                    if (index === 1) {
                        var pages = mainNavi.getPages();
                        for (var i = 0; i < pages.length - 1; i++) {
                            pages[i].destroy();
                        }
                        mainNavi.replacePage('pages/common/login/login.html');
                    }
                }
            });

        };
    }]);
