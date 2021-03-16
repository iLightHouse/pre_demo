/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/28
 * 個人持有設備
 */
app.controller("cemCysbCtrl", ['$scope', '$appConfig', '$rootScope', 'systemDropList', 'zcgdblsService', '$filter',
    function ($scope, $appConfig, $rootScope, systemDropList, zcgdblsService, $filter) {
        $scope.flag = false;// 是否有數據
        $scope.noData = false;// 是否有數據
        $scope.updown = true;// 初始化時展開
        $scope.query = {};
        $scope.fclxDrop = [];
        $scope.fcxzDrop = [];
        $scope.fcztDrop = [];
        $scope.resultList = [];// 查询出来的数据

        function init() {
            systemDropList.getDropInfoList('PREMTYPCD').then(function (list) {
                if (list) {
                    $scope.fclxDrop = list;
                }
            });
            systemDropList.getDropInfoList('PREMPROPCD').then(function (list) {
                if (list) {
                    $scope.fcxzDrop = list;
                }
            });
            systemDropList.getDropInfoList('PREMSTSCD').then(function (list) {
                if (list) {
                    $scope.fcztDrop = list;
                }
            });
        }

        // init();

        /**
         * 查詢房產信息
         */
        $scope.queryDxxx = function () {
            var params = {
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 200
                },
                "appHoldeqinVO": {
                    "psnlno": $appConfig.getUserInfo().RYBS
                }
            };
            hyMui.loaderShow();
            zcgdblsService.queryOwnEquipment(params).then(function (data) {
                hyMui.loaderHide();
                if (data && data.appHoldeqinfoVOs && data.appHoldeqinfoVOs.length > 0) {
                    $scope.updown = false;// 查询到结果关闭
                    for (var i = 0; i < data.appHoldeqinfoVOs.length; i++) {
                        data.appHoldeqinfoVOs[i].asseno = $filter('shortenNumber')(data.appHoldeqinfoVOs[i].asseno); // 去零
                        (function (i) {
                            if (data.appHoldeqinfoVOs[i].equiclas) {
                                systemDropList.getDropLable('EQUICLASCD', data.appHoldeqinfoVOs[i].equiclas).then(function (label) {
                                    data.appHoldeqinfoVOs[i].equiclasMc = label || data.appHoldeqinfoVOs[i].equiclas;
                                });
                            }
                            if (data.appHoldeqinfoVOs[i].equityp) {
                                systemDropList.getDropLable('EQUITYPCD', data.appHoldeqinfoVOs[i].equityp).then(function (label) {
                                    data.appHoldeqinfoVOs[i].equitypMc = label || data.appHoldeqinfoVOs[i].equityp;
                                });
                            }
                        }(i));
                    }
                    $scope.resultList = data.appHoldeqinfoVOs;
                } else {
                    $scope.noData = true;
                    $scope.resultList.length = 0;
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        $scope.queryDxxx();

        /**
         * 选择房产信息到用电检查创建界面
         * @param item
         */
        $scope.selectFcxx = function (item) {
            $rootScope.$broadcast('YDJCCJ_FCXX', item);
            mainNavi.popPage();
        }


    }]);