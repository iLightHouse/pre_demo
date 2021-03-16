/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/25
 * 公告消息
 */
app.controller("cemcktpCtrl", ['$scope', 'PhotoService', 'TaskService', 'dxxxService', function ($scope, PhotoService, TaskService, dxxxService) {
    var condition = mainNavi.getCurrentPage().options.condition || {};// 获取对象编号
    $scope.menus = [];

    function init() {
        var conditionInfo = changeParam();
        var param = {
            "paramMap": {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                },
                "module": conditionInfo.module || '',
                "businessNo": conditionInfo.businessNo || ''
                // "module": "CS",
                // "businessNo": "prms1000000136"
            }
        };
        hyMui.loaderShow();
        dxxxService.queryInfoFileId(param).then(function (data) {
            hyMui.loaderHide();
            // data = ['321661047813574656'];
            if (data.length > 0) {
                // 下载图片
                for (var i = 0; i < data.length; i++) {
                    getImgBase64(i, data[i]);
                }
            }
        }, function () {
            hyMui.loaderHide();
        });
    }

    init();

    /**
     * 构造对象信息查询fileId入参
     */
    function changeParam() {
        var type = condition.type;
        var propertyno = condition.propertyno;
        var param = {};
        switch (type) {
            case '房產':
                param.module = 'CS';
                param.businessNo = 'prms' + propertyno;
                break;
            case '電錶':
                param.module = 'MR';
                param.businessNo = 'APPMTRREMK' + propertyno;
                break;
            case '地址':
                param.module = 'workOrder';
                param.businessNo = propertyno;
                break;
        }
        return param;
    }

    /**
     * 请求图片：先从本地查找，未找到则请求接口并保存到本地
     * @param index
     * @param id
     */
    function getImgBase64(index, id) {
        if (!id) return;
        PhotoService.getPhoto(id).then(function (value) {
            if (value.length > 0) {
                $scope.menus[index] = value[0];
            } else {
                var param = {
                    "paramMap": {
                        "fileId": id
                    }
                };
                hyMui.loaderShow();
                TaskService.queryImgBase64(param).then(function (data) {
                    hyMui.loaderHide();
                    if (!data.osString) return;
                    $scope.menus[index] = {src: data.osString};
                    var obj = {
                        fileId: id,
                        base: data.osString
                    };
                    PhotoService.savePhoto(obj)
                }, function () {
                    hyMui.loaderHide();
                });
            }
        });
    }
}]);