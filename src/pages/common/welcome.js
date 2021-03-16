/**
 * Created by keyu on 2017/8/29.
 * 欢迎页面（初始化）控制器
 */
app.controller('WelcomeCtrl', ['$scope', '$timeout', 'systemDropList', 'YxUserService', '$hyHttp', '$hyUtil', '$appConfig', 'TFConstant', '$http',
    function ($scope, $timeout, systemDropList, YxUserService, $hyHttp, $hyUtil, $appConfig, TFConstant, $http) {
        var timer = null;
        /*---------- 定义控制器的属性和变量 ----------*/
        $scope.showWelcome = true;
        $scope.welcomeError = false;
        $scope.dlxx = {};
        var errorType = -1;//0：单点登录出错 1：获取登录信息出错 2：下拉初始化失败

        initUserInfo();

        function initUserInfo() {
            if (__APP_DEBUG) {
                login(true);
            } else {
                if (appUserInfo.isLogin) {
                    login(false);
                } else {
                    ssoLogin();
                }
            }
        }


        function ssoLogin() {
            if (!window.MSAL) {
                mainNavi.replacePage('pages/common/login/login.html');
                hyMui.alert("初始化失敗，插件不存在");
                return;
            }
            $scope.welcomeMsg = '正在拉起单点登录...';
            MSAL.login(function (res) {
                $scope.isLogin = true;
                appUserInfo.token = res.token;
                appUserInfo.loginName = res.name;
                login(false);
            }, function (res) {
                $scope.welcomeMsg = res;
            })
        }

        /**
         * 开发调试登录
         */
        function login(debug) {
            $scope.welcomeMsg = '用戶信息獲取中...';
            var serviceUrl = {
                url: TFConstant.KF_QC_URL,
                serviceName: 'queryUserLoginInfo'
            };
            var param = {
                "mrhtcd": "192.168.1.2",//测试数据
                "username": appUserInfo.loginName,
                "userpassword": appUserInfo.loginCheckCode
            };
            $hyHttp.appPost(serviceUrl, param)
                .then(function (data) {
                    if (data && data.loginId) {
                        data.RYBS = data.loginId;
                        data.GDDWBM = data.organizationid;
                        data.RYMC = data.personName;
                        data.DLZH = data.username;
                        data.MRHTID = data.mrhtid;
                        data.MRHTNO = data.mrhtno;
                        $scope.dlxx = data;
                        $appConfig.saveUserInfo(data);
                        // queryJs(data.loginId);
                        initDropTree();
                    } else if (data && data.errorMsg) {
                        if (debug) {
                            mainNavi.replacePage('pages/common/login/login.html');
                            hyMui.alert(data.errorMsg);
                        } else {
                            errorType = 1;
                            $scope.welcomeMsg = data.errorMsg || '用戶信息獲取異常';
                            $scope.welcomeError = true;
                        }
                    } else {
                        errorType = 1;
                        $scope.welcomeMsg = '用戶不存在';
                        $scope.welcomeError = false;
                        mainNavi.replacePage('pages/common/login/login.html');
                        hyMui.toast({message: '用戶不存在'});
                    }
                }, function () {
                    if (debug) {
                        mainNavi.replacePage('pages/common/login/login.html');
                    } else {
                        hyMui.toast({message: '多次失敗請點擊下方診斷網絡，以幫助您檢測是否為當前網絡問題！'});
                        errorType = 1;
                        $scope.welcomeMsg = '用戶信息獲取失敗';
                        $scope.welcomeError = true;
                    }
                });
        }

        /**
         * 重试
         */
        $scope.retry = function () {
            $scope.welcomeError = false;
            if (errorType === 0) {
                ssoLogin();
            } else if (errorType === 1) {
                login(false);
            } else if (errorType === 2) {
                initDropTree();
            }
        };

        function initDropTree() {
            $scope.welcomeMsg = '數據初始化中...';
            systemDropList.init().then(function () {
                // 登录M+
                if (window.HYMplus) {
                    if (mPlusLogin) {
                        HYMplus.logout(function (value) {
                            $timeout(function () {
                                HYMplus.init();
                                HYMplus.login(function (value) {
                                    hyMui.toast({message: 'M+登錄成功'});
                                }, function (reason) {
                                    hyMui.toast({message: 'M+登錄失敗:' + reason});
                                }, $scope.dlxx.DLZH);
                            }, 2000);
                        });
                    } else {
                        HYMplus.init();
                        HYMplus.login(function (value) {
                            hyMui.toast({message: 'M+登錄成功'});
                            mPlusLogin = true;
                        }, function (reason) {
                            hyMui.toast({message: 'M+登錄失敗:' + reason});
                        }, $scope.dlxx.DLZH);
                    }
                }
                mainNavi.replacePage('main.html', {dlxx: $scope.dlxx});
            }, function () {
                $scope.welcomeMsg = '數據初始化失敗';
                $scope.welcomeError = true;
                errorType = 2;
                $scope.$evalAsync();
            });
        }

    }]);
