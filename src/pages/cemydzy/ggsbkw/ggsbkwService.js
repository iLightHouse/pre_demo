app.factory('ggsbkwService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var ggsbkwService = {
            /**
             * 查询更改设备仓库信息
             */
            queryPackEquipList: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryPackEquipList'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var result = {
                        sbList: res.appPackeqinfoVOs || []
                    };
                    deferred.resolve(result);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存更改设备仓库信息
             */
            savePackEquipList: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'saveDMWarehouseTransferEquipmentInfo/saveDMWarehouseTransferEquipmentInfo'
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
        return ggsbkwService;
    }
]);