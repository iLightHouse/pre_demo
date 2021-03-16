app.factory('lhjcService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var lhjcService = {
            /**
             * 查询联合检查工单详情
             */
            queryLhjcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    // url: "http://172.20.194.157:8889/QueryCenter/QC/service/",
                    serviceName: 'queryJointInspectionEntitys'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        infoVo: res.jointinspectionVO || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存联合检查工单
             */
            saveLhjcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'saveJointInspectionEntity'
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
            /**
             * 查询联合检查锁信息
             */
            queryLhjcLockInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'QueryDMIRSealRecordInfoDSServiceRestController'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        voList: res.voList || []
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return lhjcService;
    }
]);