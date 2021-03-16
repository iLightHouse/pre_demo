app.factory('tdblService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var tdblService = {
            /**
             * 查询拆除封印设备信息
             */
            queryCcsbInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'pQueryChaiLockInfo'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (data) {
                    var dataArr = {
                        infoList: data.chailockinfoobjVOList || []
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查詢停電工單詳情
             */
            queryTdblGzdDetails: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'pQueryPowerOutagesEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        infoList: res.sealinfoVOList || [],
                        infoVo: res.disconordrinfoVOList[0] || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 停電工單信息保存
             */
            saveTdblGzdDetails: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_DR_URL,
                    serviceName: 'savePowerOutagesEntity'
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
             * 取消停电
             */
            cancellingDisconnection: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    // url: 'http://172.20.32.153:8888/DrService/RP/service/',//开发环境用这个地址
                    url: TFConstant.KF_RP_URL,//集成环境用这个地址
                    serviceName: 'confirmCancellingDisconnection'
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
        return tdblService;
    }
]);