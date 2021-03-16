/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/7
 * 意见反馈
 */
app.controller('wdYjfkCtrl', ['$scope', 'myService','TaskService','$appConfig', function ($scope, myService,TaskService,$appConfig) {
    var photoKey = new Date().getTime() + 'yjfk';
    // 图片上传
    $scope.commitYj = function () {
        app.yjfkModel.show();
        if (!$scope.feedback) {
            hyMui.alert('请输入反馈信息！');
            app.yjfkModel.hide();
            return;
        }
        var fjbsList = [];
        app.yjfkModel.show();
        TaskService.uploadYjfkPic(photoKey).then(function (res) {
            app.yjfkModel.hide();
            if (res && res.code == 0) {
                var data = res.content;
                if(data && data.length>0){
                    for(var i=0;i<data.length;i++){
                        fjbsList.push(data[i].fileId);
                    }
                    $scope.fjbs = fjbsList.join(',');
                }else{
                    $scope.fjbs = '';
                }
                save($scope.fjbs);
            } else {
                hyMui.alert(res.msg);
                //
            }
        }, function (err) {
            app.yjfkModel.hide();
            hyMui.alert('图片上传失败');
        });
    };
    function save(fjbs){
        app.yjfkModel.show();
        myService.tc($scope.feedback,fjbs).then(function (data) {
            app.yjfkModel.hide();
            if (data) {
                hyMui.alert('提交成功！');
                return;
            }
            hyMui.alert('提交失败,请稍后重试！');
        }, function () {
            app.yjfkModel.hide();
        });
    }
    /********************** 附件相关 Start****************************/
    $scope.photoList = [];
    /**
     * 附件初始化
     */
    function initFileList() {
        var task = {};
        TaskService.getFileByTask(task, {key: 'ONLYBS', value: photoKey}).then(function (list) {
            $scope.photoList = list || [];
        });
    }
    /**
     * 选择照相或相册相片
     */
    $scope.selectPicture = function ($callback) {
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
            success: $callback
        };
        TaskService.selectFile(task, options);
    };
    /**
     * 判断是否可删除
     * @param $item
     * @returns {boolean}
     */
    $scope.canDelFile = function ($item) {
        return $item.ISUPLOAD !== '1';
    };
    /**
     * 删除图片
     * @param $index
     * @param $item
     * @param $done
     */
    $scope.deletePhoto = function ($index, $item, $done) {
        hyMui.confirm({
            title: '',
            message: '确认删除此照片？',
            buttonLabels: ['否', '是'],
            callback: function (index) {
                if (index === 0) return;
                TaskService.deleteFile($item).then(function () {
                    $done();
                    $scope.$evalAsync();
                });
            }
        })
    };
    /********************** 附件相关 End****************************/
}]);