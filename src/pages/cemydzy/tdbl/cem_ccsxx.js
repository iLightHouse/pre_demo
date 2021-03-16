/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/16
 * 停電辦理-拆除鎖信息查詢
 */
app.controller("cemccsCtrl", ['$scope', 'NativeService', '$http', '$rootScope', 'tdblService', 'systemDropList', '$appConfig',
    function ($scope, NativeService, $http, $rootScope, tdblService, systemDropList, $appConfig) {
        var flag = mainNavi.getCurrentPage().options.flag || '';
        var cntracctno = mainNavi.getCurrentPage().options.cntracctno || '';
        $scope.flag = false;// 是否有數據
        $scope.updown = true;// 初始化時展開
        $scope.query = {};
        $scope.resultList = [];// 查询出来的数据
        var copyList = [];// 复制数据用于筛选
        var rybs = $appConfig.userInfo.RYBS;

        /**
         * 复选框选择，点击效果+去重
         * 增加一个标识，代表选中，用到选中的数据时，用这个标识进行判断
         * @type {Array}
         */
        var checkSpxx = [];
        $scope.pgSelected = function (item) {
            item.isSel = !item.isSel;
            if (!item) {
                return;
            }
            var index = checkSpxx.indexOf(item);//获取每一个item的位置
            //判断item是否存在数组
            if (index >= 0) { //存在的话点击会移出数组
                checkSpxx.splice(index, 1);
            } else {
                checkSpxx.push(item);
            }
        };

        /**
         * 查詢鎖信息  通过接口
         */
        $scope.queryDxxxByJk = function () {
            hyMui.loaderShow();
            var param = {
                "cntracctno": cntracctno
            };
            tdblService.queryCcsbInfo(param).then(function (data) {
                /*data={
                    infoList:[
                        {
                            "sealno":"E123764304",
                            "sealloc":"1",
                            "sealequicate":"1"
                        },{
                            "sealno":"E123768534",
                            "sealloc":"2",
                            "sealequicate":"2"
                        },{
                            "sealno":"E123709534",
                            "sealloc":"3",
                            "sealequicate":"3"
                        }
                    ]
                };*/
                if (data && data.infoList && data.infoList.length > 0) {
                    // $scope.resultList = data.infoList;
                    dealSbNData(0, data.infoList.length, data.infoList);
                    /*for (var i = 0; i < data.infoList.length; i++) {
                        (function (i) {
                            // 翻译设备类别
                            systemDropList.getDropLable('EQUICATGCD', data.infoList[i].sealequicate).then(function (label) {
                                data.infoList[i].sealequicateMc = label || data.infoList[i].sealequicate;
                            });
                            // 翻译加封位置
                            systemDropList.getDropLable('SEALLOCCD', data.infoList[i].sealloc).then(function (label) {
                                data.infoList[i].seallocMc = label || data.infoList[i].sealloc;
                            });
                        })(i);
                    }
                    $scope.resultList = data.infoList;*/
                    hyMui.loaderHide();
                } else {
                    $scope.resultList = [];
                    hyMui.loaderHide();
                }
            }, function () {
                hyMui.loaderHide();
            })
        };

        $scope.queryDxxxByJk();

        /**
         * 處理装拆设备数据
         * 下拉翻譯
         */
        function dealSbData(data) {
            /*sealassemeteequiuniqid 加封对象      sealloc  加封位置*/
            //加封对象名称
            for (var i = 0; i < data.length; i++) {
                switch (data[i].sealequicate) {
                    case '01':
                        data[i].sealequicateMc = '電能表';
                        break;
                    case '02':
                        data.sealequicateMc = '互感器';
                        break;
                    case '03':
                        data[i].sealequicateMc = '計量點';
                        break;
                }
                //加封位置
                systemDropList.getDropLable('SEALLOCCD', data[i].sealloc).then(function (label) {
                    data[i].seallocMc = label || data[i].sealloc;
                });
            }

            return data;
        }

        // dealSbNData(0, data.infoList.length, data.infoList);
        /**
         * 處理装拆设备数据
         * 下拉翻譯
         */
        function dealSbNData(i, j, data) {
            switch (data[i].sealequicate) {
                case '01':
                    data[i].sealequicateMc = '電能表';
                    break;
                case '02':
                    data[i].sealequicateMc = '互感器';
                    break;
                case '03':
                    data[i].sealequicateMc = '計量點';
                    break;
            }
            //加封位置
            systemDropList.getDropLable('SEALLOCCD', data[i].sealloc).then(function (label) {
                data[i].seallocMc = label || data[i].sealloc;
                $scope.resultList.push(data[i]);
                copyList.push(data[i]);
                if (++i < j) {
                    dealSbNData(i, j, data);
                }
            });

        }

        /**
         * 将选择的设备传递到上一个界面
         * fd 復電辦理 zc 裝拆信息錄入 else 停電辦理
         * @param item
         */
        $scope.confirmSb = function () {
            if (flag === 'fd') {
                $rootScope.$broadcast('CEMJCXM_CCSXXGD', checkSpxx);
            } else if (flag === 'zc') {
                checkSpxx.forEach(function (item) {
                    item.sealirflgcd = '15';// 变更标志
                    item.oprtr = rybs;// 操作人
                });
                $rootScope.$broadcast('CEMJCXM_CCSXXZC', checkSpxx);
            } else if (flag === 'lh') {
                checkSpxx.forEach(function (item) {
                    item.sealirflgcd = '15';// 变更标志
                    item.oprtr = rybs;// 操作人
                });
                $rootScope.$broadcast('CEMJCXM_CCSXXLH', checkSpxx);
            } else {
                $rootScope.$broadcast('CEMJCXM_CCSXX', checkSpxx);
            }
            mainNavi.popPage();
        };

        /**
         * 筛选数据
         * @param list
         * @returns {*}
         */
        $scope.queryByCondition = function () {
            $scope.resultList = copyList.filter(function (item) {
                if (item.sealno.indexOf($scope.query.zcbh) !== -1) {
                    return item
                }
            });
        };

        /**
         * 扫一扫电表号码
         */
        $scope.scanMeter = function () {
            NativeService.scan().then(function (data) {
                $scope.query.zcbh = data;
            });
        };
    }]);