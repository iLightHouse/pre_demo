/**
 * Created by ym on 2017/2/27.
 */

var rootScopeObj = {}; //存储Angular模块的根作用域
var appUserInfo = {};//用户信息
// appUserInfo.token = "eyJ0eXAiOiJKV1QiLCJub25jZSI6Ik8xbmhoTGU1RHF1bDMyY3BENlBpSUZwM18xVVA3Ymg3dkJpXzM4dlRTcU0iLCJhbGciOiJSUzI1NiIsIng1dCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyIsImtpZCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yZDVjMWVjYi1lMDY0LTQ4MTEtOTY3Zi1jNDNlMzM3ZjhmNDIvIiwiaWF0IjoxNTk3OTEyNzU2LCJuYmYiOjE1OTc5MTI3NTYsImV4cCI6MTU5NzkxNjY1NiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFTUUEyLzhRQUFBQTlZaEwydGdVdnhEdnA5R08rS0lqTDg1K0gzTkc4N3FCQ2NSSzB6M25lTDA9IiwiYW1yIjpbInB3ZCJdLCJhcHBfZGlzcGxheW5hbWUiOiJDQ1MgVFNUIE1vYmlsZSBBcHBSIiwiYXBwaWQiOiI1ZjQ5NDliMS00NjkxLTQ4OWQtYjJhOC04NTM5YjZmZTU4YjQiLCJhcHBpZGFjciI6IjAiLCJnaXZlbl9uYW1lIjoibzM2NXQiLCJpcGFkZHIiOiIyMjMuMTA0LjE4OC4xMjEiLCJuYW1lIjoibzM2NXQiLCJvaWQiOiI3NWEyN2Y1YS05ZjIwLTQyNDEtODFhOC02YmM3Y2FkMGFhZmMiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMTMwNTYwOTUyOS0xNTI3OTIwNTI4LTc3NjY3NDA3Ny0xODk1MDgiLCJwbGF0ZiI6IjEiLCJwdWlkIjoiMTAwMzNGRkY5RTRDQjY4RCIsInNjcCI6Im9wZW5pZCBwcm9maWxlIFVzZXIuUmVhZCBlbWFpbCIsInN1YiI6ImkxamtiU3FncFNIWDNmcGEtN19UNUVCbG15TXVVRkZLX29jZUFfdzVUS1kiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiIyZDVjMWVjYi1lMDY0LTQ4MTEtOTY3Zi1jNDNlMzM3ZjhmNDIiLCJ1bmlxdWVfbmFtZSI6Im8zNjV0QGNlbS1tYWNhdS5jb20iLCJ1cG4iOiJvMzY1dEBjZW0tbWFjYXUuY29tIiwidXRpIjoiNnVRaXR4ektYMGFiSE9mcXVnVEFBQSIsInZlciI6IjEuMCIsInhtc19zdCI6eyJzdWIiOiJ4QnZCSmRKOThLM0MxMy1NejQ4QU5BLVZ0c0hGM2t4bTJwblNYNkFSVGtRIn0sInhtc190Y2R0IjoxNDIyODQzNDIyfQ.luoTf_5tBH507Qw1TFlF1p8OkFUvXjBnPEBx3CGYP6pmmirMSFaDOL1aGO1cZv5HoPgC3tRfM4A_B3m1wpcYOcSykQnjBOE-dmX-Mk5QQYRPxK4xp-BU5pMX08hLdi3GgMOAqjO27PWwhuDoqxKr445N5RciCK8l2bpXUeyWpOC8bxfj0VelvQW7dretFIeqBMtJ9CPMALk2-a7QMVh5PVULMPBAfTpBqj-eLAFWDSBSuRTphG_4Z5D590-SKHConORERcxQW5mBAYIWLp0P55dWD1AbgVtRohXKpi9hI_XjG1b4Tj3Kv1wGLeD4TcFgsd9Mgn-4Gc5GlMzAhvniAQ";
// var __APP_DEBUG = true;//测试选项，正式打包设置为false
var __APP_DEBUG = true;//测试选项，正式打包设置为false
var _appInit = __APP_DEBUG;
var connectionType = 1;//1直连CCS服务，2通过代理连接（TST）
var zeroPadding = false; // 编号是否补零 true 不补零，false 补零
var mPlusLogin = false;// false 未登录 true 已登录

/***
 * 判断是否为ios设备
 * @returns {boolean}
 */
function isIos_runjs() {
    return !!window.navigator.userAgent.match(/(ipad|iphone|ipod touch)/i);
}

/**
 * 处理应用版本更新操作
 */
var _inintHyAppUpdate = function () {
    if (!window.HYAppUpdate) {
        return;
    }
    var token = "Bearer " + appUserInfo.token;
    var hyAppUpdate = new HYAppUpdate();
    if (isIos_runjs()) {//苹果的版本更新封装到壳里面了，这里不再执行
        hyAppUpdate.check(null, null, {token: token});
        return;
    }
    var toUpdate = function (showProgress) {
        if (showProgress) appVersionUpdate.show();//展示版本更新进度条
        hyAppUpdate.update(function () {
            if (showProgress) appVersionUpdate.hide();
        }, function () {
            if (showProgress) {
                appVersionUpdate.hide();
                rootScopeObj.hyAlert('版本更新失败!');
            }
        }, {token: token});
    };
    hyAppUpdate.check(function (result) {
        if (result.renewFlag === 'Y') {
            var fileSize = result.fileSize + (result.replaceType === 'part' ? ' KB' : ' MB');
            var forceUpdate = result.forceUpdate === 'Y';
            var html = '<div>' +
                '<div>检查到新版本(' + result.versionName + ')，是否立即更新?</div>' +
                '<div>文件大小：' + fileSize + '</div>' +
                '<div>本次更新修改：</div>' +
                '<div>' + result.versionDes + '</div>' +
                '</div>';
            ons.notification.confirm({
                messageHTML: html,
                title: '版本更新',
                buttonLabels: ['取消', '更新'],
                animation: 'fade',
                cancelable: false,
                callback: function (index) {
                    if (index === 1) {//调用update方法下载更新
                        toUpdate(true);
                    } else {
                        if (forceUpdate) {
                            navigator.app.exitApp();
                        }
                    }
                }
            });
        }
    }, function (e) {
    }, {token: token});


    // 下载更新进度信息
    hyAppUpdate.onprogress = function (event) {
        if (event.lengthComputable) {
            var percentComplete = event.loaded / event.total;
            rootScopeObj.$apply(function () {
                rootScopeObj.appVersionUpdateProgress.value = parseInt(percentComplete * 100);
            });
        }
    };
};

/**
 * 处理Cordova设备已就位的监听事件
 */
document.addEventListener("deviceready", function () {
    // _inintHyAppUpdate();//处理版本更新操作
    _initData();
    _appInit = true;
});

/**
 * 数据初始化
 * @private
 */
function _initData() {
    if (window.AMapNavi) {
        AMapNavi.init({appKey: "80a09b12ba8890e1b3d9d17a14fce582"}, function () {
        }, function () {
        });
    }
}

var app = hyMui.bootstrap(['nwConifgModule', 'angular-sortable-view'], {
    isDev: true
});
hyMui.loaderShow = function () {
    appLoader.show();
    /*appLoader.getDeviceBackButtonHandler().enable();
    appLoader.getDeviceBackButtonHandler().setListener(function () {
        hyMui.loaderHide();
    })*/
};
hyMui.loaderHide = function () {
    appLoader.hide();
    // appLoader.getDeviceBackButtonHandler().disable();
};
app.config(['$provide', function ($provide) {
    $provide.decorator('$hyHttp', ["$delegate", "$q", '$appConfig', 'TFConstant', '$http', hyHttpDecorator]);
}]);


app.run(['$rootScope', '$hyHttp', '$appConfig',
    function ($rootScope, $hyHttp, $appConfig) {
        $rootScope.appVersionUpdateProgress = {
            min: 0,
            max: 100,
            value: 0
        };
        rootScopeObj = $rootScope;
        hyMui._config.mainUrl = 'pages/common/login/login.html';
        $appConfig.mainUrl = hyMui._config.mainUrl;

        /**
         * 物理键回退监听
         */
        var backNum = 0;
        ons.setDefaultDeviceBackButtonListener(function () {
            backNum++;
            if (backNum > 1) {//连续回退多余1下
                // 登录M+，还未实现登录当前登录人的账号逻辑
                if (window.HYMplus) {
                    HYMplus.logout();
                }
                navigator.app.exitApp(); // Close the app
                return;
            }
            if (backNum === 1) {
                //吐司提醒再按一次推出程序
                var time = 3000;//清零时间
                hyMui.toast({message: '再按一次退出程序', duration: time}, function () {
                    backNum = 0;
                });
            }
        });
    }
]);
app.controller('MainCtrl', ['$scope', '$timeout', '$hyUtil', function ($scope, $timeout, $hyUtil) {
    var reLoginTime = 18000;// 重新登录间隔时长（s）
    var appOperateKey = 'cem_ydzy_operate_time'; // 操作时间（触碰、返回、挂起）
    var timeout = null;


    listenStartEnd();// 监听手机操作（用不到可注释）

    /**
     * 触碰屏幕
     */
    $scope.pan = function () {
        operate();
        // $timeout.cancel(timeout);
        // timeout = $timeout(operate, 1000);
    };

    /**
     * 一小时不操作则重新登录
     */
    function operate() {
        // 当前时间与触碰时间比较，间隔一小时重新登录
        var operateTime = $hyUtil.getLocal(appOperateKey) || ''; // 触碰时间
        if (operateTime) {
            var currentTime = new Date().getTime();
            var time = (currentTime - operateTime) / 1000;
            if (time > reLoginTime) {
                // 提示重新登录
                reLogin();
            } else {
                // 记录操作时间
                saveOperateTime();
            }
        } else {
            // 当前页为登录页则不记录操作时间
            var flag = isSaveTime();
            if (flag) {
                saveOperateTime();
            }
        }
    }

    /**
     * 事件监听：进入应用、离开应用、物理回退
     */
    function listenStartEnd() {
        if (!window.appStart) {
            // 进入应用
            document.addEventListener("resume", onAppStart, false);
            window.appStart = true;
        }
        if (!window.appEnd) {
            // 挂起应用
            document.addEventListener("pause", onAppEnd, false);
            window.appEnd = true;
        }
        if (!window.appBackButton) {
            document.addEventListener("backbutton", onBackButton, false);
            window.appBackButton = true;
        }
    }

    function onAppStart() {
        // 进入应用时与离开应用时间比较
        var appInactivationTime = $hyUtil.getLocal(appOperateKey) || ''; // 应用操作时间
        if (!appInactivationTime) return;
        var activationTime = new Date().getTime();
        var time = (activationTime - appInactivationTime) / 1000;
        if (time > reLoginTime) {
            // 提示重新登录
            reLogin();
        }
    }

    function onAppEnd() {
        // 离开应用，记录时间
        var flag = isSaveTime();
        if (flag) {
            saveOperateTime();
        }
    }

    function onBackButton() {
        operate();
    }

    /**
     * 保存操作时间
     */
    function saveOperateTime() {
        var nowTime = new Date().getTime();
        $hyUtil.saveLocal(appOperateKey, nowTime);
    }

    /**
     * 重新登录
     */
    function reLogin() {
        var pages = mainNavi.getPages();
        for (var i = 0; i < pages.length; i++) {
            pages[i].destroy();
        }
        mainNavi.replacePage('pages/common/login/login.html', {
            cancelIfRunning: true
        });
    }

    /**
     * 是否保存时间
     * @returns {boolean} true 是
     */
    function isSaveTime() {
        var flag = true;
        var pages = mainNavi.getPages();
        if (pages) {
            if (pages.length === 1) {
                if (pages[0].name === 'pages/common/login/login.html') {
                    flag = false;
                }
            } else if (pages.length === 2) {
                if (pages[1].name === 'pages/common/shezhi/cem_shezhi.html') {
                    flag = false;
                }
            }
        }
        return flag;
    }

}]);

/**
 * @ngInject
 */
function hyHttpDecorator($delegate, $q, $appConfig, TFConstant, $http) {
    var serviceMap = TFConstant.SERVICE_MAP;
    /**
     * 对服务请求的错误进行统一分类处理方法
     */
    $delegate.rejectError = function (deferred, message, type) {
        message = message || '未知錯誤';
        type = type || 0;
        var _message = "";
        if (type === 1) { //通讯错误
            _message = "通訊異常:" + message;
        } else if (type === 0) { //业务系统服务异常
            _message = "服務消息:" + message;
        } else {
            _message = message;
        }
        hyMui.toast({
            message: _message
        });
        deferred.reject(_message);
    };

    /**
     * 针对营销系统封装的网络请求
     */
    $delegate.appPost = function (service, args, config) {
        var outTime = localStorage.getItem('ydzy_local_network_time') || 30000;
        if (typeof outTime === 'string') {
            outTime = Number(outTime);
        }
        var deferred = $q.defer();
        var self = this;
        args = args || {};
        config = config || angular.extend({}, this.defaultConfig);
        config.timeout = config.timeout || outTime;
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json';
        if (appUserInfo.token) {
            config.headers.Authorization = "Bearer " + appUserInfo.token;
        }
        var mainUrl;
        if (connectionType === 1) {
            mainUrl = service.url + service.serviceName;
        } else {
            if (!service.serviceName || !serviceMap[service.serviceName]) {
                console.error('服务【' + service.serviceName + '】未配置映射关系，请检查');
                deferred.reject();
                return deferred.promise;
            }
            if (serviceMap[service.serviceName] == 'CreateEwmService') {//調用移動管理後台生成二維碼隨機碼服務
                mainUrl = $appConfig.appUrl + '/file/register/' + args.fileId;
            } else {
                mainUrl = $appConfig.appUrl + '/service/' + serviceMap[service.serviceName];
            }
        }
        execute();

        function execute() {
            if (args && args instanceof Array && connectionType !== 1) {
                args = {"inParamList": JSON.stringify(args)};
            }
            $http.post(mainUrl, JSON.stringify(args), config).success(function (res) {
                if (connectionType === 1) {
                    hyMui.logger().info(['调用' + service.serviceName + '成功:', args, res]);
                    if (res || res == 0) {
                        deferred.resolve(res);
                    } else {
                        deferred.reject("返回參數異常");
                    }
                } else {
                    if (res && res.code === 200) {
                        // hyMui.logger().info(['调用' + service.serviceName + '成功:', args, res]);
                        var data;
                        try {
                            data = JSON.parse(res.data)
                        } catch (e) {
                            data = res.data;
                        }
                        if (data.result === 'FAILED') {
                            hyMui.logger().error(['调用' + service.serviceName + '失败:', args, res]);
                            deferred.resolve(data);
                        } else {
                            hyMui.logger().info(['调用' + service.serviceName + '成功:', args, res]);
                            deferred.resolve(data);
                        }
                    } else {
                        hyMui.logger().error(['调用' + service.serviceName + '失败:', args, res]);
                        deferred.resolve(res ? res.data || {} : {});
                    }
                }

            }).error(function (error) {
                if (error && error.error && error.error.code === "InvalidAuthenticationToken") {
                    if (window.MSAL) {
                        MSAL.token(function (token) {
                            appUserInfo.token = token;
                            execute();
                        }, function (res) {
                            deferred.reject('重新获取token失败');
                        })
                    } else {
                        deferred.reject(self.defaultErrorMessage);
                    }
                } else {
                    if (config.showError === false) {
                        deferred.reject(self.defaultErrorMessage);
                    } else {
                        self.rejectError(deferred, self.defaultErrorMessage, 1);
                    }
                }
            });
        }

        return deferred.promise;
    };

    function setDeviceInfo(args) {
        var userInfo = $appConfig.getUserInfo();
        if (!userInfo)
            return;
        var deviceBaseInfo = {};
        deviceBaseInfo.rybs = userInfo.RYBS;
        /*账号标识 */
        deviceBaseInfo.dlzh = userInfo.DLZH;
        /*登陆账号 */
        deviceBaseInfo.rymc = userInfo.RYMC;
        /*人员名称 */
        deviceBaseInfo.dqbm = userInfo.DQBM;
        /*地区编码 */
        deviceBaseInfo.gddwbm = userInfo.GDDWBM;
        /*供电单位编码 */
        deviceBaseInfo.zzbm = userInfo.ZZBM;
        /*组织编码 */
        if (window.device) {
            deviceBaseInfo.osStr = window.device.platform;
            /*手机操作系统。Android系统返回android；IOS系统返回ios；*/
            deviceBaseInfo.osVersionSr = window.device.version;
            /*操作系统版本*/
            deviceBaseInfo.phoneModelStr = window.device.model;
            /*手机型号。如“htc 6950”*/
        }
        if (args.sceneNameStr) {//场景名称，用sceneNameStr
            deviceBaseInfo.sceneNameStr = args.sceneNameStr;
        }
        if (args.moduleNameStr) {//模块名称，用moduleNameStr
            deviceBaseInfo.moduleNameStr = args.moduleNameStr;
        }
        args.deviceBaseInfo = JSON.stringify(deviceBaseInfo);
    }

    return $delegate;
}

//解决echarts水球在低版本浏览器报错问题
if (typeof Object.assign !== 'function') {
    Object.assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
}
app.directive("errSrc", function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});
