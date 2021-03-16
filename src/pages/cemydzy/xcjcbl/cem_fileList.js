/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/28
 * 房產信息查詢
 */
app.controller("cemFileListCtrl", ['$scope', 'NativeService', '$http', '$rootScope', 'systemDropList', 'dxxxService', 'TaskService',
    function ($scope, NativeService, $http, $rootScope, systemDropList, dxxxService, TaskService) {
        var wkordrno = mainNavi.getCurrentPage().options.wkordrno;// 工作單編號
        $scope.resultList = [];// 查询出来的数据

        /**
         * 查詢附件列表
         */
        $scope.queryFileList = function () {
            var params = {
                "paramMap": {
                    "pageInfo": {
                        "allPageNum": 0,
                        "allRowNum": 0,
                        "curPageNum": 1,
                        "rowOfPage": 100
                    },
                    "module": "workOrder",
                    // "businessNo": "100000000111" //工单号
                    "businessNo": wkordrno //工单号
                }
            };
            hyMui.loaderShow();
            dxxxService.queryInfoFileId(params, 'fileList').then(function (data) {
                hyMui.loaderHide();
                data.forEach(function (item) {
                    if (item.fileSizeK / 1024 > 1) {
                        item.fileSizeK = (item.fileSizeK / 1024).toFixed(2) + 'MB'
                    } else if (item.fileSizeK > 0) {
                        item.fileSizeK = item.fileSizeK + 'KB'
                    } else {
                        item.fileSizeK = (item.fileSizeK / 1024).toFixed(2) + 'KB'
                    }
                });
                $scope.resultList = data;
                //过滤协议信息
                for (var i = 0; i < $scope.resultList.length; i++) {
                    (function (i) {
                        DOWNLOAD_FILE_INFO.all()
                            .filter('fjbs', '=', $scope.resultList[i].fileId)
                            .list(null, function (results) {
                                if (results.length > 0) {
                                    $scope.resultList[i].SFXZ = true;
                                } else {
                                    $scope.resultList[i].SFXZ = false;
                                }
                                callback();
                            });
                    })(i);
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        function callback() {
            $scope.$evalAsync();
        }

        $scope.queryFileList();

        /**
         * 选择房产信息到用电检查创建界面
         * @param item
         */
        $scope.selectFile = function (item) {
            mainNavi.pushPage('pages/cemydzy/xcjcbl/wjxzlb/wjxzlb.html', {
                cancelIfRunning: true,
                methodName: 'cxFileManagedownloadFile',
                options: {
                    fileId: item.fileId
                },
                fileName: item.fileName
            });
        };

        $scope.$on("filedownload", function (det, data) {
            for (var i = 0; i < $scope.resultList.length; i++) {
                if ($scope.resultList[i].fileId === data) {
                    $scope.resultList[i].SFXZ = true;
                }
            }
            $scope.$evalAsync();
        });

        /**
         * 查看文件
         * @param item
         */
        $scope.openfile = function (item) {
            DOWNLOAD_FILE_INFO.all()
                .filter('fjbs', '=', item.fileId).order('time', false)
                .list(null, function (results) {
                    TaskService.openLoadFile(decodeURI(results[0].url), 'application/msword')
                });
        };

    }]);