app.controller('LoginCtrl', ['$scope', '$timeout', '$appConfig', '$hyUtil',
    function ($scope, $timeout, $appConfig, $hyUtil) {
        var timer = null;
        // 清空手机操作时间
        $hyUtil.saveLocal('cem_ydzy_operate_time', '');
        $scope.showLogin = __APP_DEBUG;
        appUserInfo.isLogin = false;
        /*---------- 定义控制器的属性和变量 ----------*/
        $scope.accountInfo = {
            loginName: '',
            loginCheckCode: ''
        };

        initUserInfo();

        if (!_appInit) {
            hyMui.loaderShow();
            init();
        } else {
            initLogin();
        }

        function init() {
            if (timer)
                $timeout.cancel(timer);
            if (_appInit) {
                hyMui.loaderHide();
                initLogin();
            } else {
                timer = $timeout(function () {
                    init();
                }, 100);
            }
        }

        function initLogin() {
            if (!window.MSAL) {
                return;
            }
            hyMui.loaderShow();
            MSAL.init(function (name) {
                $scope.userName = name || '';
                appUserInfo.loginName = $scope.userName;
                appUserInfo.isLogin = !!$scope.userName;
                $scope.$evalAsync();
                if (appUserInfo.isLogin) {
                    MSAL.token(function (token) {
                        appUserInfo.token = token;
                        hyMui.loaderHide();
                    }, function (res) {
                        hyMui.loaderHide();
                    })
                } else {
                    hyMui.loaderHide();
                }
            }, function () {
                hyMui.loaderHide();
            });
        }

        /**
         * 设置账号
         * 默认账号优先级  1、手动输入账号  2、上次登录账号  3、移动云网账号
         */
        function initUserInfo() {
            if (__APP_DEBUG) {
                appUserInfo.loginName = '';
                appUserInfo.loginCheckCode = '';
            }
            var lastLoginUser = $appConfig.getUserInfo();
            if (lastLoginUser) {
                appUserInfo.loginName = lastLoginUser.DLZH || '';
                $scope.userName = lastLoginUser.RYMC || '';
            }
            if (appUserInfo) {
                $scope.accountInfo.loginName = appUserInfo.loginName || '';
                $scope.accountInfo.loginCheckCode = appUserInfo.loginCheckCode || '';
            }
        }

        $scope.$watch('accountInfo.loginName', function () {
            if (!$scope.accountInfo.loginName) {
                $scope.accountInfo.loginCheckCode = '';
            }
        });


        var errorTypeMessage = {
            account: '賬號不能為空',
            phoneNumber: '手機號碼不能為空',
            loginCheckCode: '密碼不能為空',
            verCode: '验证码不能为空',
            code_1: '登录服务连接失败！',
            code_2: "登录服务名为空!",
            code_105: '密码不正确',
            code_201: '非法登录，该设备没有授权',
            code12: "密码错误",
            code2: "业务服务处理错误",
            other: '登录发生未知异常'
        };

        /*---------- 控制器内部使用的函数 ----------*/

        /**
         * 显示错误信息，并返回状态标识
         * @returns {boolean}
         */
        function showErrorMessage() {
            if ($scope.errorMessage !== "") {
                $scope.isMessageShow = true;
                hyMui.alert($scope.errorMessage);
                return false;
            }
            return true;
        }

        /**
         * 进行表单验证
         * @returns {boolean}
         */
        function isFormValidation() {
            $scope.isMessageShow = false;
            $scope.errorMessage = "";
            // if ($scope.accountInfo.loginCheckCode === "") {
            //     $scope.errorMessage = errorTypeMessage.loginCheckCode;
            // }
            if ($scope.accountInfo.loginName === "") {
                $scope.errorMessage = errorTypeMessage.account;
            }
            return showErrorMessage();
        }

        /*---------- 页面上用到的方法 ----------*/

        /**
         * 登录按钮操作
         */
        $scope.login = function () {
            // 记录手机操作时间
            var nowTime = new Date().getTime();
            $hyUtil.saveLocal('cem_ydzy_operate_time', nowTime);
            if (__APP_DEBUG) {
                appUserInfo.loginName = $scope.accountInfo.loginName;
                appUserInfo.loginCheckCode = $scope.accountInfo.loginCheckCode;
                if (isFormValidation()) {
                    mainNavi.replacePage('pages/common/welcome.html');
                }
            } else {
                mainNavi.replacePage('pages/common/welcome.html');
            }
        };
        $scope.goToExample = function () {
            mainNavi.pushPage('pages/example/example.html');
        };

        /**
         * 设置
         */
        $scope.toSetting = function () {
            mainNavi.pushPage('pages/common/shezhi/cem_shezhi.html', {
                cancelIfRunning: true
            })
        }
    }]);
