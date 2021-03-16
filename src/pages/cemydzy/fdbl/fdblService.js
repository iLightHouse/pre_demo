app.factory('fdblService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var fdblService = {
            /**
             * 查詢復電工單詳情
             */
            queryFdblGzdDetails: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryPowerRecoverEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        infoList: res.sealinfovos || [],
                        infoVo: res.apprcnntordrinfovo || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 復電工單信息保存
             */
            saveFdblGzdDetails: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_DR_URL,
                    serviceName: 'savePowerRecoverEntity'
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
        return fdblService;
    }
]);