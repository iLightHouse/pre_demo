app.factory('lsjdService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var lsjdService = {
            /**
             * 查询臨時檢定工单详情
             */
            queryLsjdOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryTemporaryChecksEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        jcxmList: res.apptempcheckitemVOList || [],
                        sbList: res.appcheckequipmentVOList || [],
                        infoVo: res.apptemporarychecksVO || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存臨時檢定工单
             */
            saveLsjdOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'saveTemporaryChecksEntity'
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
             * 查詢現場檢查設備列表
             */
            queryXcjcSbList: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryTemporaryElectEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        jcxmList: res.appCheckitemVOList || [],
                        sbList: res.appDeviceVOList || []
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
        };
        return lsjdService;
    }
]);