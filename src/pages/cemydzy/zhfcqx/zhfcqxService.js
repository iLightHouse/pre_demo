app.factory('zhfcqxService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var zhfcqxService = {
            /**
             * 查询合约账户信息
             */
            queryContractAccount: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryContractAccount'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        caoutList: res.caoutList
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询房产信息
             */
            queryPropertyNumber: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryPropertyNumber'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        appElectricityList: res.appElectricityList
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 根据电表号查询合约账户等字段
             */
            queryBasicOrder: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryBasicOrder'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        vo: res.vo,
                        resultVo:res.resultVo
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存装拆创建服務
             * @param param
             */
            saveZccjInfo: function (param) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'createAssembleDismantleOrder/createAssembleDismantleOrder',
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 查詢裝拆設備列表服務
             * @param param
             */
            queryZcsbInfo: function (param) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryAssemblyEquipmentList',
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 保存裝拆設備列表服務
             * @param param
             */
            saveZcsbInfo: function (param) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'saveAssemblyEquipmentList',
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 查詢保存成功后的電能表裝拆設備記錄
             * @param param
             */
            queryZcsbjl: function (param) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryDnbBjzcsbjl/query',
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 查詢保存成功后的互感器裝拆設備記錄
             * @param param
             */
            queryHgqZcsbjl: function (param) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryHgqBjzcsbjl/query',
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            }
        };

        return zhfcqxService;
    }
]);