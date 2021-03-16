app.factory('gzclService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var gzclService = {
            /**
             * 查询故障设备工单详情
             */
            queryGzsbOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryJointInspectionEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存故障處理工单
             */
            saveGzclOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'appSaveFailureHandlingEntityService/save'
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
        return gzclService;
    }
]);