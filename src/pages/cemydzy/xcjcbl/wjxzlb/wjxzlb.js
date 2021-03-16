/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/10/13
 * 文件下载列表
 */
app.controller("wjxzlbCtrl", ['$scope', 'TaskService', '$filter', '$appConfig', '$rootScope', 'xcjcService',
    function ($scope, TaskService, $filter, $appConfig, $rootScope, xcjcService) {
        // 获取上个页面参数
        var options = mainNavi.getCurrentPage().options.options;
        var fileName = mainNavi.getCurrentPage().options.fileName;
        var methodName = mainNavi.getCurrentPage().options.methodName;
        var fileId = '';
        var rybs = $appConfig.userInfo.RYBS +'';
        // $scope.SortType = 1;
        $scope.checkType = 0;
        $scope.loadingFileList = [];
        $scope.fileList = [];
        var pattern = /\([0-9]+\)$/;

        /**
         * 初始化方法
         */
        function init(randomId) {
            methodName = methodName || 'dzqmdownloadFile';
            var fjbs = methodName + '-' + new Date().getTime();
            if (options) fjbs = options.fileId;
            var fileListInfo = DOWNLOAD_FILE_INFO.all()
                .filter('rybs', '=', rybs);
            //.filter('enabled', '=', '1');
            //if(fjbs) fileListInfo = fileListInfo.filter('fjbs', '=', fjbs);
            fileListInfo.list(null, function (results) {
                //下载完成列表
                $scope.fileList = results.filter(function (item) {
                    return item.enabled != '1' || item.percent >= 100;
                });
                //未完成列表
                $scope.loadingFileList = results.filter(function (item) {
                    return item.enabled == '1' && item.percent < 100;
                });
                // 如果任何一个为空则不下载
                if (!options || !fileName) {
                    $scope.checkType = 1;
                    $scope.$evalAsync();
                    return;
                }
                fileName = getFileName(fileName, results);
                var fileInfo = new DOWNLOAD_FILE_INFO({
                    fileName: fileName,
                    createTime: new Date().getTime(),
                    time: new Date().getTime(),
                    url: '',
                    rybs: rybs,
                    fjbs: fjbs,
                    percent: 0,
                    serviceName: 'methodName',
                    options: options,
                    enabled: '1'
                });
                $scope.loadingFileList.push(fileInfo);
                $scope.$evalAsync();
                var success = function (file) {
                    if (!file) return;
                    if (fjbs) {
                        $rootScope.$broadcast('filedownload', fjbs);
                    }
                    $scope.loadingFileList.splice($scope.loadingFileList.indexOf(file), 1);
                    $scope.fileList.push(file);
                    $scope.checkType = 1;
                    $scope.$evalAsync();
                };
                var error = function (file) {
                    hyMui.alert('文件下載失敗');
                    if (!file) return;
                    $scope.loadingFileList.splice($scope.loadingFileList.indexOf(file), 1);
                    $scope.fileList.push(file);
                    $scope.checkType = 1;
                    $scope.$evalAsync();
                };

                TaskService.downloadFilePer(methodName, fileInfo, options, randomId).then(function (entry) {
                    if (success) success(entry);
                }, function (en) {
                    if (error) error(en);
                }, function (data) {

                });
            });
        }

        // init();

        function downloadFile() {
            var param = {
                "fileId": options.fileId
            };
            hyMui.loaderShow();
            xcjcService.createEwm(param).then(function (res) {
                hyMui.loaderHide();
                if (res) {//随机码{"code":200,"data":"4bc90167-a9db-4978-b5a1-e33faee53b05","message":null}
                    if(connectionType == 2){//现场环境返回的res就是随机数4bc90167-a9db-4978-b5a1-e33faee53b05，run.js里直接取的data对象里的值返回的
                        if(res.indexOf('-')>-1){
                            init(res);
                        }
                    }else{
                        if(res.data){//家里环境
                            init(res.data);
                        }
                    }
                } else {
                    // $scope.nr = "生成二維碼失敗";
                }
            }, function () {
                // $scope.nr = "生成二維碼失敗";
                hyMui.loaderHide();
            });
        }

        downloadFile();

        function getFileName(fileName, list) {
            // 文件名处理
            if (!list || list.length <= 0) return fileName;
            var name = fileName.substring(0, fileName.lastIndexOf('.'));
            var fileKzm = fileName.substring(fileName.lastIndexOf('.') + 1);
            var num = 0;
            for (var i = 0; i < list.length; i++) {
                var itemName = list[i].fileName;
                if (itemName == fileName) {
                    num++;
                    continue;
                }
                var kzm = itemName.substring(itemName.lastIndexOf('.') + 1);
                var iName = itemName.substring(0, itemName.lastIndexOf('.'));
                if (kzm.toLowerCase() != fileKzm.toLowerCase()) {
                    continue;
                }
                var matchArr = iName.match(pattern);
                if (!matchArr) continue;
                if (iName == name + ' ' + matchArr[0]) {
                    num++;
                }
            }
            if (num > 0) fileName = name + ' (' + num + ').' + fileKzm;
            return fileName;
        }

        /**
         * 打开文件
         * @param file
         */
        $scope.openFile = function (file) {
            if (file.enabled != '1') return;
            TaskService.openLoadFile(decodeURI(file.url));
        };

        /**
         * Tab页切换
         * @param type
         */
        $scope.selectSortType = function (type) {
            $scope.checkType = type;// 赋值切换项
        };

        /**
         * Tab页切换樣式控制
         * @param type
         * @returns {boolean}
         */
        $scope.integral = function (type) {
            return $scope.checkType === type;
        };
    }]);