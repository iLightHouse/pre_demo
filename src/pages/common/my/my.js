/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/7
 * 我的页面控制器
 */
app.controller('wdCtrl', ['$scope', '$appConfig', 'myService', 'myDgService', 'TaskService',
    function ($scope, $appConfig, myService, myDgService, TaskService) {
        // 获取用户信息
        $scope.userInfo = $appConfig.userInfo || {};
        var tjr = $appConfig.userInfo.RYBS;
        //定义上传图片标志
        var photoKey = new Date().getTime() + 'wddf';
        /*$scope.pageInfo = [{
            label: '签到',
            pageUrl: 'pages/common/my/qiandao.html'
        }, {
            label: '我的信息',
            pageUrl: 'ewm'
        }, {
            label: '地图监控',
            pageUrl: 'pages/dtjk/dtjk.html'
        }, {
            label: '文件下载列表',
            pageUrl: 'pages/common/wjxzlb/wjxzlb.html'
        }, {
            label: '意见反馈',
            pageUrl: 'pages/common/my/yjfk.html'
        }, {
            label: '系统设置',
            pageUrl: 'pages/common/my/xtsz.html'
        }
            // , {
            //     label: '修改密码',
            //     pageUrl: 'pages/common/home/xgmm.html'
            // }
        ];*/
        $scope.pageInfo = [{
            id: '1',
            label: '签到',
            srcUrl: 'img/wgjl/dg/my/qiandao.png',
            pageUrl: 'pages/wgjl/dg/common/my/qiandao.html'
        }, {
            id: '2',
            label: '文件下载列表',
            srcUrl: 'img/wgjl/dg/my/wjxzlb.png',
            pageUrl: 'pages/wgjl/dg/common/wjxzlb/wjxzlb.html'
        }, {
            id: '2',
            label: '意见反馈',
            srcUrl: 'img/wgjl/dg/my/yjfk.png',
            pageUrl: 'pages/wgjl/dg/common/my/yjfk.html'
        }, {
            id: '2',
            label: '系统设置',
            srcUrl: 'img/wgjl/dg/my/xtsz.png',
            pageUrl: 'pages/wgjl/dg/common/my/xtsz.html'
        }, {
            id: '2',
            label: '我的信息',
            srcUrl: 'img/wgjl/dg/my/wdxx.png',
            onclick: function () {
                wdDialog.show();
            }
        }];
        //生成我的信息dialog二维码信息
        $scope.content = 'BEGIN:VCARD ';
        $scope.content += '\r\nFN:' + $appConfig.userInfo.RYMC;
        if ($appConfig.userInfo.YJDZ)
            $scope.content += '\r\nORG:' + $appConfig.userInfo.YJDZ;
        if ($appConfig.userInfo.SJ)
            $scope.content += '\r\nTEL;type=CELL,VOICE:' + $appConfig.userInfo.SJ;
        if ($appConfig.userInfo.BGDH)
            $scope.content += '\r\nTEL;type=HOME,VOICE:' + $appConfig.userInfo.BGDH;
        $scope.content += '\r\nEND:VCARD';
        // 注销登录
        $scope.zxapp = function () {
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
        // 页面跳转
        $scope.showDetailMy = function (item) {
            var flag = true;

            if (!item)
                return;
            if (item.pageUrl && item.pageUrl == 'ewm') {
                wdDialog.show();
                return;
            }
            mainNavi.pushPage(item.pageUrl, {flag: flag, cancelIfRunning: true});
        };
        /*********************dialog*******************************/
        // 根据pageInfo进行页面跳转
        $scope.showDetailMy = function (item) {
            if (!item)
                return;
            var flag = true;
            if (item.pageUrl) {
                mainNavi.pushPage(item.pageUrl, {flag: flag, cancelIfRunning: true});
                return;
            }
            if (item.onclick && angular.isFunction(item.onclick)) {
                item.onclick.call(this);
            }

        };
        //初始化dialog
        var ckDialog = null;
        var wdDialog = null;
        var initDialog = function () {
            ons.ready(function () {
                ons.createDialog('pages/wgjl/dg/common/my/ewmDialog.html', {parentScope: $scope}).then(function (dialog) {
                    ckDialog = dialog;
                });
            });
            ons.ready(function () {
                ons.createDialog('pages/wgjl/dg/common/my/wdxxDialog.html', {parentScope: $scope}).then(function (dialog) {
                    wdDialog = dialog;
                });
            });
        };
        initDialog();

        //下载上传二维码
        function downLoadewm() {
            showModel();
            myDgService.df(tjr).then(function (data) {
                if (data && data.length > 0) {
                    $scope.buttonShow = '1';
                    $scope.sr = data[0].fjbs;
                } else {
                    $scope.buttonShow = '0';
                    $scope.cs = 'img/wgjl/dg/my/cstp.png';
                }
                $scope.init = true;
                hideModel();
            }, function () {
                hideModel();
            });
        }

        //放大图片
        $scope.enlargeImage = function () {
            ckDialog.show();
            downLoadewm();
        };
        //关闭图片
        $scope.closeImage = function () {
            ckDialog.hide();
        };
        /**
         * 选择照相或相册相片
         */
        $scope.selectPicture = function () {
            ckDialog.hide();
            var task = {
                GZDBH: '',  //工作单编号
                RWH: '',  //任务号
                HJH: '', //环节号
                YWLX: '1',  //类型
                YWCLR: $appConfig.userInfo.DLZH,  //上传人登录账号
                FJFZBS: '-1',
                BZ: '',  //备注
                MBH: '1',  //模板号
                MBBBH: '2',  //模板版本号
                YHBH: '3',  //用户编号
                ENABLED: '1',
                ONLYBS: photoKey
            };
            var options = {
                success: function (res) {
                    hideModel();
                    if (res && res.code === 0) {
                        hyMui.alert('上传成功');
                        ckDialog.show();
                        downLoadewm();
                    } else {
                        hyMui.alert(res.msg || '上传失败');
                    }
                },
                error: function (res) {
                    hideModel();
                    if (res && res.code === -1) {
                        hyMui.alert(res.message || '上传失败，请重新上传');
                    }
                },
                beforUpload: function () {
                    showModel();
                }
            };
            TaskService.selectImage(task, options);
        };

        /**
         * 显示遮罩层
         */
        function showModel() {
            if (app.wdModel) {
                app.wdModel.show();
            } else {
                $onsen.componentWhen('app.wdModel').then(function (object) {
                    object.show();
                });
            }
        }

        /**
         * 隐藏遮罩层
         */
        function hideModel() {
            app.wdModel.hide();
        }
    }]);
