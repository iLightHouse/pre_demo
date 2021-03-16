app.factory('ryxxService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var ryxxService = {
            /**
             * 查询装拆工单分派工单详情
             */
            queryRyxxInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryXtRyInfo'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return ryxxService;
    }
]);