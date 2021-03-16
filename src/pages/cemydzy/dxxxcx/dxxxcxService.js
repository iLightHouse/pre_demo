app.factory('dxxxService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var dxxxService = {
            /**
             * 查询房产对象信息
             */
            queryHouseInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryHouseInfoService'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        votList: res.votList
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询地址对象信息
             */
            queryAddressInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryAddressInfoRestController'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        votList: res.votList
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询供电点对象信息
             */
            queryElectInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'pQueryElectInfo'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        votList: res.objVoList || []
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询电表对象信息
             */
            queryMeterInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryMeterInfo'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        votList: res.queryMeterInfoVOList
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询对象信息fileID
             * flag 查看附件(查询全部信息)，为空则只查询fileId
             */
            queryInfoFileId: function (params, flag) {
                flag = flag || '';
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_FRAME_URL,
                    serviceName: 'sysAttach/retrieve'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var fileIdAry = [];
                    var paramMap = res.paramMap;
                    if (paramMap.data && paramMap.data.length > 0) {
                        paramMap.data.forEach(function (item) {
                            if (!flag) {
                                item.fileId ? fileIdAry.push(item.fileId) : null;
                            } else {
                                fileIdAry.push(item);
                            }
                        })
                    }
                    deferred.resolve(fileIdAry);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询对象信息fileID
             * flag 查看附件(查询全部信息)，为空则只查询fileId
             */
            queryRemoveEquipList: function (params, flag) {
                flag = flag || '';
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryRemoveEquipList'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        votList: res.appRemoveeqinfoVOs,
                        allRowNum: res.pageInfo && res.pageInfo.allRowNum
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询供电点坐标
             */
            queryGddPosition: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_CS_URL,
                    // url: 'http://172.20.194.89:8882/CsService/CS/service/',
                    serviceName: 'TransformSupplyPointCoordinate'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var position = {};
                    if (res) {
                        if (res.voList instanceof Array && res.voList.length > 0) {
                            position = res.voList[0];
                        }
                    }
                    deferred.resolve(position);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };

        return dxxxService;
    }
]);