/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/02/28
 * 合約賬戶查詢
 */
app.controller("cemydzyhyzhcxCtrl", ['$scope', 'NativeService', '$http', '$rootScope', 'systemDropList', 'zhfcqxService', '$filter',
    function ($scope, NativeService, $http, $rootScope, systemDropList, zhfcqxService, $filter) {
        $scope.flag = false;// 是否有數據
        $scope.updown = true;// 初始化時展開
        $scope.query = {};
        $scope.khlxDrop = [];
        $scope.resultList = [];// 查询出来的数据

        function init() {
            systemDropList.getDropInfoList('CUSTTYPCD').then(function (list) {
                if (list) {
                    $scope.khlxDrop = list;
                }
            });
        }

        init();

        /**
         * 查詢合约账户信息
         */
        $scope.queryDxxx = function () {
            if (!$scope.query.custdocno && !$scope.query.custnm && !$scope.query.custtyp && !$scope.query.custno && !$scope.query.detaaddr) {
                hyMui.alert('請輸入查詢條件');
                return
            }
            var params = {
                "caqryVO": {
                    "custdocno": $scope.query.custdocno,
                    "custnm": $scope.query.custnm,
                    "custno": $filter('lengthenNumber')(10, $scope.query.custno),// 补零
                    "custtyp": $scope.query.custtyp,
                    "detaaddr": $scope.query.detaaddr
                },
                "pageInfo": {
                    "allPageNum": 0,
                    "allRowNum": 0,
                    "curPageNum": 1,
                    "rowOfPage": 100
                }
            };
            hyMui.loaderShow();
            zhfcqxService.queryContractAccount(params).then(function (data) {
                hyMui.loaderHide();
                if (data && data.caoutList.length > 0) {
                    $scope.resultList = data.caoutList;
                    $scope.updown = false;// 查询到结果关闭
                    for (var i = 0; i < data.caoutList.length; i++) {
                        data.caoutList[i].cntracctno = $filter('shortenNumber')(data.caoutList[i].cntracctno);
                        data.caoutList[i].asseno = $filter('shortenNumber')(data.caoutList[i].asseno);
                        if (data.caoutList[i].contacctcatg) {
                            (function (i) {
                                systemDropList.getDropLable('CONTACCTCATGCD', data.caoutList[i].contacctcatg).then(function (label) {
                                    data.caoutList[i].contacctcatgmc = label || data.caoutList[i].contacctcatg;
                                });
                            }(i));
                        }
                        if (data.caoutList[i].induclas) {
                            (function (i) {
                                systemDropList.getDropLable('INDUCLASCD', data.caoutList[i].induclas).then(function (label) {
                                    data.caoutList[i].induclasmc = label || data.caoutList[i].induclas;
                                });
                            }(i));
                        }
                    }
                } else {
                    $scope.resultList.length = 0;
                }
            }, function () {
                hyMui.loaderHide();
            });
        };

        /**
         * 选择房产信息到用电检查创建界面
         * @param item
         */
        $scope.selectFcxx = function (item) {
            $rootScope.$broadcast('YDJCCJ_HYZH', item);
            mainNavi.popPage();
        }

    }]);