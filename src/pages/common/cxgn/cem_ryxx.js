/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/24
 * 人员查询
 */
app.controller("cemryxxCtrl", ['$scope', 'ryxxService', '$rootScope', '$appConfig', '$hyHttp', 'TFConstant', 'systemDropList',
    function ($scope, ryxxService, $rootScope, $appConfig, $hyHttp, TFConstant, systemDropList) {
        $scope.flag = false;// 是否有數據
        $scope.updown = true;// 初始化時展開
        $scope.query = {};
        $scope.resultList = [];// 查询出来的数据
        $scope.treeObj = {
            scdwObj: {label: '', code: ''}//单位
        };
        systemDropList.getDropLable('ZZXX', $appConfig.getUserInfo().GDDWBM).then(function (label) {
            label = label || $appConfig.getUserInfo().GDDWBM;
            //供电单位赋值
            $scope.treeObj = {
                scdwObj: {label: label, code: $appConfig.getUserInfo().GDDWBM}//单位
            };
        });

        /**
         * 查詢人员信息
         */
        $scope.queryDxxx = function () {
            $scope.updown = false;// 查詢條件自動隱藏
            var param = {
                "loginId": "",
                "partyGroupId": $scope.treeObj.scdwObj.code,
                "personName": $scope.query.personName,
                "personWorkCode": ""
            };
            hyMui.loaderShow();
            ryxxService.queryRyxxInfo(param).then(function (data) {
                hyMui.loaderHide();
                var compare = function (prop) {
                    return function (obj1, obj2) {
                        var val1 = obj1[prop];
                        var val2 = obj2[prop];
                        if (val1 < val2) {
                            return -1;
                        } else if (val1 > val2) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                };
                $scope.resultList = data.sort(compare('personName'));
            }, function () {
                hyMui.loaderHide();
            });
        };

        /**
         * 选择人員信息
         * @param item
         */
        $scope.selectRyxx = function (item) {
            $rootScope.$broadcast('CEMYDZY_RYXX', item);
            mainNavi.popPage();
        };
        /**
         * 選擇供電單位
         * @param item
         */
        var subPerOrgList = [];
        $scope.getGddwTreeData = function ($level, $parent, $callback) {
            if ($level > 0) {//非跟节点
                var dropList = subPerOrgList.filter(function (item) {
                    return item.parentCode == $parent.code;
                });
                $callback(dropList);
                return;
            }
            var serviceUrl = {
                url: TFConstant.KF_QC_URL,
                serviceName: 'queryXtZzInfo'
            };
            var param = {
                "partygroupid": $appConfig.getUserInfo().GDDWBM
            };
            $hyHttp.appPost(serviceUrl, param)
                .then(function (data) {
                    var topItem = data;
                    var root = {};
                    root.code = 999;
                    root.label = '部門選擇';
                    subPerOrgList = getZzDropList(topItem);
                    $callback(root);
                });
        };

        function getZzDropList(orgsList) {
            if (!orgsList || !angular.isArray(orgsList)) return [];
            var list = [];
            for (var i = 0; i < orgsList.length; i++) {
                var id = orgsList[i].organizationId + "";
                var parentCode = orgsList[i].upperOrganizationId;
                if(i===0){
                    parentCode = 999;
                }
                var item = {
                    code: id,
                    label: orgsList[i].groupName || "CEM",
                    parentCode: parentCode
                    //notSelect: true
                };
                list.push(item);
            }
            return list;
        }
    }]);