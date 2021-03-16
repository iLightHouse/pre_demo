/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/25
 * 公告消息
 */
app.controller("cemgbCtrl", ['$scope', '$hyUtil', 'PhotoService', 'TFConstant', '$sce', function ($scope, $hyUtil, PhotoService, TFConstant, $sce) {
    $scope.news = [];// 消息
    $scope.newsNum = 0;
    var searchDialog = null;// 查看图片Dialog
    var emoticons = [
        {mark: '/yun', label: '<img src="img/emoticons/yun.gif" class="cem-emoticon"/>'},
        {mark: '/jy', label: '<img src="img/emoticons/jy.gif" class="cem-emoticon"/>'},
        {mark: '/wx', label: '<img src="img/emoticons/wx.gif" class="cem-emoticon"/>'},
        {mark: '/pz', label: '<img src="img/emoticons/pz.gif" class="cem-emoticon"/>'},
        {mark: '/se', label: '<img src="img/emoticons/se.gif" class="cem-emoticon"/>'},
        {mark: '/bt', label: '<img src="img/emoticons/bt.gif" class="cem-emoticon"/>'},// 鼻涕（发呆）
        {mark: '/dy', label: '<img src="img/emoticons/dy.gif" class="cem-emoticon"/>'},// 得意
        {mark: '/dk', label: '<img src="img/emoticons/dk.gif" class="cem-emoticon"/>'},
        {mark: '/hx', label: '<img src="img/emoticons/hx.gif" class="cem-emoticon"/>'},
        {mark: '/bz', label: '<img src="img/emoticons/bz.gif" class="cem-emoticon"/>'},
        {mark: '/sj', label: '<img src="img/emoticons/sj.gif" class="cem-emoticon"/>'},
        {mark: '/liul', label: '<img src="img/emoticons/liul.gif" class="cem-emoticon"/>'},
        {mark: '/gang', label: '<img src="img/emoticons/gang.gif" class="cem-emoticon"/>'},
        {mark: '/dn', label: '<img src="img/emoticons/dn.gif" class="cem-emoticon"/>'},
        {mark: '/tp', label: '<img src="img/emoticons/tp.gif" class="cem-emoticon"/>'},
        {mark: '/cy', label: '<img src="img/emoticons/cy.gif" class="cem-emoticon"/>'},
        {mark: '/ng', label: '<img src="img/emoticons/ng.gif" class="cem-emoticon"/>'},
        {mark: '/kuk', label: '<img src="img/emoticons/kuk.gif" class="cem-emoticon"/>'},
        {mark: '/fd', label: '<img src="img/emoticons/fd.gif" class="cem-emoticon"/>'},// 非典
        {mark: '/zk', label: '<img src="img/emoticons/zk.gif" class="cem-emoticon"/>'},
        {mark: '/dt', label: '<img src="img/emoticons/dt.gif" class="cem-emoticon"/>'},
        {mark: '/tx', label: '<img src="img/emoticons/tx.gif" class="cem-emoticon"/>'},
        {mark: '/ka', label: '<img src="img/emoticons/ka.gif" class="cem-emoticon"/>'},
        {mark: '/by', label: '<img src="img/emoticons/by.gif" class="cem-emoticon"/>'},
        {mark: '/aom', label: '<img src="img/emoticons/aom.gif" class="cem-emoticon"/>'},
        {mark: '/jie', label: '<img src="img/emoticons/jie.gif" class="cem-emoticon"/>'},
        {mark: '/kun', label: '<img src="img/emoticons/kun.gif" class="cem-emoticon"/>'},
        {mark: '/jk', label: '<img src="img/emoticons/jk.gif" class="cem-emoticon"/>'},
        {mark: '/liuh', label: '<img src="img/emoticons/liuh.gif" class="cem-emoticon"/>'},
        {mark: '/hanx', label: '<img src="img/emoticons/hanx.gif" class="cem-emoticon"/>'},
        {mark: '/db', label: '<img src="img/emoticons/db.gif" class="cem-emoticon"/>'},
        {mark: '/fend', label: '<img src="img/emoticons/fend.gif" class="cem-emoticon"/>'},
        {mark: '/zm', label: '<img src="img/emoticons/zm.gif" class="cem-emoticon"/>'},
        {mark: '/yw', label: '<img src="img/emoticons/yw.gif" class="cem-emoticon"/>'},
        {mark: '/xu', label: '<img src="img/emoticons/xu.gif" class="cem-emoticon"/>'},
        {mark: '/kh', label: '<img src="img/emoticons/kh.gif" class="cem-emoticon"/>'},
        {mark: '/shuai', label: '<img src="img/emoticons/shuai.gif" class="cem-emoticon"/>'},
        {mark: '/kl', label: '<img src="img/emoticons/kl.gif" class="cem-emoticon"/>'},
        {mark: '/qd', label: '<img src="img/emoticons/qd.gif" class="cem-emoticon"/>'},
        {mark: '/baibai', label: '<img src="img/emoticons/baibai.gif" class="cem-emoticon"/>'},
        {mark: '/lh', label: '<img src="img/emoticons/lh.gif" class="cem-emoticon"/>'},
        {mark: '/ch', label: '<img src="img/emoticons/ch.gif" class="cem-emoticon"/>'},
        {mark: '/kb', label: '<img src="img/emoticons/kb.gif" class="cem-emoticon"/>'},
        {mark: '/gz', label: '<img src="img/emoticons/gz.gif" class="cem-emoticon"/>'},
        {mark: '/qiu', label: '<img src="img/emoticons/qiu.gif" class="cem-emoticon"/>'},
        {mark: '/huaix', label: '<img src="img/emoticons/huaix.gif" class="cem-emoticon"/>'},
        {mark: '/zhh', label: '<img src="img/emoticons/zhh.gif" class="cem-emoticon"/>'},
        {mark: '/yhh', label: '<img src="img/emoticons/yhh.gif" class="cem-emoticon"/>'},
        {mark: '/hq', label: '<img src="img/emoticons/hq.gif" class="cem-emoticon"/>'},
        {mark: '/bs', label: '<img src="img/emoticons/bs.gif" class="cem-emoticon"/>'},
        {mark: '/wq', label: '<img src="img/emoticons/wq.gif" class="cem-emoticon"/>'},
        {mark: '/kkul', label: '<img src="img/emoticons/kkul.gif" class="cem-emoticon"/>'},
        {mark: '/yx', label: '<img src="img/emoticons/yx.gif" class="cem-emoticon"/>'},
        {mark: '/qing', label: '<img src="img/emoticons/qing.gif" class="cem-emoticon"/>'},
        {mark: '/xia', label: '<img src="img/emoticons/xia.gif" class="cem-emoticon"/>'},
        {mark: '/kel', label: '<img src="img/emoticons/kel.gif" class="cem-emoticon"/>'},
        {mark: '/cd', label: '<img src="img/emoticons/cd.gif" class="cem-emoticon"/>'},
        {mark: '/pj', label: '<img src="img/emoticons/pj.gif" class="cem-emoticon"/>'},
        {mark: '/lq', label: '<img src="img/emoticons/lq.gif" class="cem-emoticon"/>'},
        {mark: '/pingp', label: '<img src="img/emoticons/pingp.gif" class="cem-emoticon"/>'},
        {mark: '/kf', label: '<img src="img/emoticons/kf.gif" class="cem-emoticon"/>'},
        {mark: '/mf', label: '<img src="img/emoticons/mf.gif" class="cem-emoticon"/>'},
        {mark: '/qiang', label: '<img src="img/emoticons/qiang.gif" class="cem-emoticon"/>'},
        {mark: '/ruo', label: '<img src="img/emoticons/ruo.gif" class="cem-emoticon"/>'},
        {mark: '/ws', label: '<img src="img/emoticons/ws.gif" class="cem-emoticon"/>'},
        {mark: '/sl', label: '<img src="img/emoticons/sl.gif" class="cem-emoticon"/>'},
        {mark: '/baoq', label: '<img src="img/emoticons/baoq.gif" class="cem-emoticon"/>'},
        {mark: '/ok', label: '<img src="img/emoticons/ok.gif" class="cem-emoticon"/>'}
    ];

    function init() {
        $scope.news = $hyUtil.getLocal(TFConstant.LOCAL_MJ_NEWS) || [];// 消息列表
        var flag = $scope.news.some(function (item) {
            return item.fromName === '表情测试'
        });
        if (!flag) {
            $scope.news.unshift({
                fromName: '表情测试',
                fromTime: '2020-11-21 00:13:13',
                type: 'text',
                message: '有人總是抱怨自己過得不好/yun/jy，一上秤卻又胖了不少/wx/pingp/ok/baoq/kkul'
            },{
                fromName: '表情测试',
                fromTime: '2020-11-21 00:22:22',
                type: 'text',
                message: '老王四十多歲開始謝頂，於是整個人都變得很敏感，經不起別人說自己禿，有一天一輛拖拉機從老王身邊駛過，老王整個人都崩潰了'
            });
        }
        $scope.news.forEach(function (item) {
            if (item.type === 'img') {
                /*!function (item) {
                    PhotoService.getPhoto(item.message).then(function (value) {
                        item.imgSrc = value[0].src;
                    });
                }(item)*/
                PhotoService.getPhoto(item.message).then(function (value) {
                    item.imgSrc = value[0].src;
                });
            }
            if (item.type === 'text') {
                updateEmoticons(item);
            }
            /*if (item.type === 'text' || item.type === 'img') {
                if (window.HYMplus) {
                    if (!item.read) {
                        HYMplus.setRead(function () {
                            hyMui.alert('chatId:'+item.chatId+',msgId:'+item.msgId+',instanceId:'+item.instanceId);
                        }, null, item.chatId, item.msgId, item.instanceId);
                    }
                }
            }*/
        });
    }

    init();

    function updateEmoticons(item) {
        if (item.message && item.message.indexOf('/') !== -1) {
            var messageHtml = item.message;
            emoticons.forEach(function (val) {
                var re = new RegExp(val.mark, "g");
                if (messageHtml.indexOf(val.mark) !== -1) {
                    messageHtml = messageHtml.replace(re, val.label);
                }
            });
            item.messageHtml = $sce.trustAsHtml(messageHtml);
        } else {
            item.messageHtml = $sce.trustAsHtml(item.message);
        }
    }

    $scope.$on('REFRESH_MJ_NEWS', function () {
        $scope.news = $hyUtil.getLocal(TFConstant.LOCAL_MJ_NEWS) || [];// 消息列表
        $scope.news.forEach(function (item) {
            if (item.type === 'img') {
                /*!function (item) {
                    PhotoService.getPhoto(item.message).then(function (value) {
                        item.imgSrc = value[0].src;
                    });
                }(item)*/
                PhotoService.getPhoto(item.message).then(function (value) {
                    item.imgSrc = value[0].src;
                });
            }
            /*if (item.type === 'text' || item.type === 'img') {
                if (window.HYMplus) {
                    if (!item.read) {
                        HYMplus.setRead(function () {
                            hyMui.alert('已读了2');
                        }, null, item.chatId, item.msgId, item.instanceId);
                    }
                }
            }*/
        });
        $scope.$evalAsync();
    });

    /**
     * 退出页面销毁定时器
     */
    $scope.$on('$destroy', function () {
        $scope.news.forEach(function (item) {
            item.read = true;
            if (item.imgSrc) delete item.imgSrc;
        });
        $hyUtil.saveLocal(TFConstant.LOCAL_MJ_NEWS, $scope.news);
    });

    /**
     * 创建图片面板
     */
    var initDialog = function () {
        ons.ready(function () {
            ons.createDialog('pages/common/gb/viewImage.html', {parentScope: $scope}).then(function (dialog) {
                searchDialog = dialog;
            });
        });
    };

    initDialog();

    $scope.showImg = function (img) {
        $scope.src = img;
        searchDialog.show();
    }

}]);