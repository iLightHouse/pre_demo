/**
 * Version:1.0.0
 * Author:lxj
 * Date:2019/05/16
 * 搜索
 */
app.controller("cemmyCtrl", ['$scope', 'PhotoService', '$appConfig', 'systemDropList', '$hyUtil', 'TFConstant',
    function ($scope, PhotoService, $appConfig, systemDropList, $hyUtil, TFConstant) {
        //供电单位
        $scope.zzxxObj = {};
        systemDropList.getDropLable('ZZXX', $appConfig.getUserInfo().GDDWBM).then(function (label) {
            label = label || $appConfig.getUserInfo().GDDWBM;
            //供电单位赋值
            $scope.zzxxObj = {label: label, code: $appConfig.getUserInfo().GDDWBM};
            $scope.info = {
                name: $appConfig.getUserInfo().RYMC,
                gddwmc: $scope.zzxxObj.label,
                dlzh: $appConfig.getUserInfo().DLZH
                // bz: '裝裱一班',
                // zw: '班長'
            };
        });
        $scope.buffer = '506.4kb';

        /**
         * 跳轉到設置密碼界面
         */
        $scope.toSetting = function () {
            mainNavi.pushPage('pages/common/shezhi/cem_mmsd.html', {
                cancelIfRunning: true
            })
        };

        /**
         * 清除緩存
         */
        $scope.clearData = function () {
            hyMui.confirm({
                title: '確認',
                message: '確定清除緩存嗎？',
                buttonLabels: ['取消', '確定'],
                callback: function (i) {
                    if (i !== 1) {
                        return;
                    }
                    var clearDateStr = $hyUtil.getLocal(TFConstant.LOCAL_CLEAR_TIME);// 获取清除缓存时间
                    // 清除相机缓存照片（只保留当天的照片）
                    PhotoService.delCameraPhoto(clearDateStr).then(function (value) {
                        if (value.status === '1') {
                            PhotoService.delCemPhoto(clearDateStr).then(function (value) {
                                if (value.status === '1') {
                                    hyMui.alert('緩存圖片已清除')
                                } else {
                                    hyMui.alert('緩存圖片清除失敗')
                                }
                            });
                        }
                    });
                    // 清除下拉数据缓存
                    localStorage.setItem('__WGJL_SYSCODE_DROP', JSON.stringify({}));
                    DB_SYS_DROP_CODE.all().destroyAll();
                }
            })
        };

        /**
         * 退出登錄
         */
        $scope.loginOut = function () {
            hyMui.confirm({
                title: '確認',
                message: '要退出該賬號嗎?',
                buttonLabels: ['取消', '確定'],
                callback: function (index) {
                    if (index === 1) {
                        // 登录M+，还未实现登录当前登录人的账号逻辑
                        if (window.HYMplus) {
                            HYMplus.logout();
                            mPlusLogin = false;
                        }
                        var pages = mainNavi.getPages();
                        for (var i = 0; i < pages.length - 1; i++) {
                            pages[i].destroy();
                        }
                        // if (window.MSAL) {
                        //     hyMui.loaderShow();
                        //     MSAL.logout(function (res) {
                        //         hyMui.loaderHide();
                        //         appUserInfo = {};
                        //         mainNavi.replacePage('pages/common/login/login.html', {
                        //             cancelIfRunning: true
                        //         });
                        //     }, function (res) {
                        //         hyMui.loaderHide();
                        //         hyMui.alert('登出失败');
                        //     });
                        // } else {
                            mainNavi.replacePage('pages/common/login/login.html', {
                                cancelIfRunning: true
                            });
                        // }
                    }
                }
            });
        };

        /**
         * GPS展示
         */
        $scope.loginGps = function () {
            mainNavi.pushPage('pages/common/gpszs/cem_gps.html', {
                cancelIfRunning: true
            })
        };
    }]);