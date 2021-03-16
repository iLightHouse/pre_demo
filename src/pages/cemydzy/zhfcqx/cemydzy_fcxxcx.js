/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/02/28
 * 房產信息查詢
 */
app.controller("cemydzyfcxxcxCtrl", ['$scope', 'NativeService', '$http', '$rootScope','systemDropList','zhfcqxService','$filter',
    function ($scope, NativeService, $http, $rootScope,systemDropList,zhfcqxService,$filter) {
    $scope.flag = false;// 是否有數據
    $scope.updown = true;// 初始化時展開
    $scope.query = {};
    $scope.fclxDrop = [];
    $scope.fcxzDrop = [];
    $scope.fcztDrop = [];
    $scope.resultList = [];// 查询出来的数据

    function init(){
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
    init();

    /**
     * 查詢房產信息
     */
    $scope.queryDxxx = function () {
        if (!$scope.query.detaaddr && !$scope.query.premno && !$scope.query.premprop && !$scope.query.premsts && !$scope.query.premtyp) {
            hyMui.alert('請輸入查詢條件');
            return
        }
        var params = {
            "pageInfo": {
                "allPageNum": 0,
                "allRowNum": 0,
                "curPageNum": 1,
                "rowOfPage": 100
            },
            "propertyVo": {
                "detaaddr": $scope.query.detaaddr,
                "premno": $scope.query.premno,
                "premprop": $scope.query.premprop,
                "premsts": $scope.query.premsts,
                "premtyp": $scope.query.premtyp
            }
        };
        hyMui.loaderShow();
        zhfcqxService.queryPropertyNumber(params).then(function (data) {
            hyMui.loaderHide();
            if (data && data.appElectricityList.length > 0) {
                $scope.resultList = data.appElectricityList;
                $scope.updown = false;// 查询到结果关闭
                for(var i = 0;i<data.appElectricityList.length;i++){
                    data.appElectricityList[i].cntracctno = $filter('shortenNumber')(data.appElectricityList[i].cntracctno);
                    data.appElectricityList[i].asseno = $filter('shortenNumber')(data.appElectricityList[i].asseno);
                    if(data.appElectricityList[i].premtyp){
                        (function (i) {
                            systemDropList.getDropLable('PREMTYPCD', data.appElectricityList[i].premtyp).then(function (label) {
                                data.appElectricityList[i].premtypmc = label ||data.appElectricityList[i].premtyp;
                            });
                        }(i));
                    }
                    if(data.appElectricityList[i].premprop){
                        (function (i) {
                            systemDropList.getDropLable('PREMPROPCD', data.appElectricityList[i].premprop).then(function (label) {
                                data.appElectricityList[i].prempropmc = label ||data.appElectricityList[i].premprop;
                            });
                        }(i));
                    }
                    if(data.appElectricityList[i].premsts){
                        (function (i) {
                            systemDropList.getDropLable('PREMSTSCD', data.appElectricityList[i].premsts).then(function (label) {
                                data.appElectricityList[i].premstsmc = label ||data.appElectricityList[i].premsts;
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
        $rootScope.$broadcast('YDJCCJ_FCXX', item);
        mainNavi.popPage();
    }


}]);