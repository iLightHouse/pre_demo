app.factory('azwzxxService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var azwzxxService = {
            /**
             * 查询安裝位置詳情
             */
            queryAzwzInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryAzwz/query'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = res.voList || [];
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
        };
        return azwzxxService;
    }
]);