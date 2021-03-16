app.factory('aqyhjcService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var aqyhjcService = {
            /**
             * 查询安全隐患检查工单详情
             */
            queryAqyhjcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryPotentialRiskEntity/queryPotentialRiskEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        jcxmList: res.list || [],
                        infoVo: res.potentialriskVo || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存安全隐患检查工单
             */
            saveAqyhjcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'savePotentialRiskEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        rslt: res.rslt || '',
                        rsltinfo: res.rsltinfo || ''
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询安全隐患复查工单详情
             */
            queryAqyhfcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryPotentialRiskRecheckEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        lastList: res.appsccheckitemVOList || [],
                        newList: res.apppotencheckitemVOList || [],
                        infoVo: res.potentialriskVO || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
        };
        return aqyhjcService;
    }
]);