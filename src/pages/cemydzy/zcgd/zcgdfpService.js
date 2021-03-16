app.factory('zcgdfpService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var zcgdfpService = {
            /**
             * 查询装拆工单分派工单详情
             */
            queryZcgdfpOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryDismountingAssignEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        zcfpVo: {}
                    };
                    if (res && res.voList && res.voList.length > 0) {
                        dataArr.zcfpVo = res.voList[0];
                    }
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存装拆工单分派工单
             */
            saveZcfpOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'saveDismountingAssignEntity'
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
            }
        };
        return zcgdfpService;
    }
]);