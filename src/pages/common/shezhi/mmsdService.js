app.factory('mmsdService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var mmsdService = {
            /**
             * 保存密碼
             */
            savePwdInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_EP_URL,
                    serviceName: 'chgPassword'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };

        return mmsdService;
    }
]);