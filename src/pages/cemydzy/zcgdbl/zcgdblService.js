app.factory('zcgdblsService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var zcgdblService = {
            /**
             * 查询装拆工单详情
             */
            queryZcgdblOrderInfo: function (params, flag) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryAssemblyInfo'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var infoVo = null;
                    if (flag === 'pllr') {
                        infoVo = res.tskList || [];
                    } else {
                        infoVo = res.tskList && res.tskList.length > 0 ? res.tskList[0] : {}; // 基本信息
                    }
                    var dataArr = {
                        infoVo: infoVo,// 基本信息
                        mtrList: res.mtrList || [],// 电能表数组
                        readList: res.readList || [],// 电能表示数数组
                        induList: res.induList || [],// 互感器数组
                        mcbList: res.mcbList || [],// 互感器数组
                        sealList: res.sealList || [],// 锁数组
                        ggcsList: res.ggcsList || []// 计量配表时的规格技术参数数组
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存装拆工单
             */
            saveZcgdblOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_ME_URL,
                    serviceName: 'AppsaveAssemblyInfo'
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
             * 查询新装、更换电能表示数
             */
            queryNewOrUpdateReadList: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'querydmregisterreadinginstallationandremovalinfo/query'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        readingList: res.voList || []// 电能表示数数组
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询电能表、互感器设备参数
             */
            queryEquipmentParameter: function (params,flag) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryequipmentmasterdata/querydmequipmenttypeandtechnicalparameterinfods'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    if (flag === 'check') {
                        // 单个对象不存在，接口返回的是null
                        deferred.resolve(res);
                    }else {
                        var dataArr = {};
                        if (res.curtramparmVo) {
                            dataArr.curtranrati = res.curtramparmVo.curtranrati;// 电流互感器变比
                        }
                        if (res.engymtrparmVo) {
                            dataArr.phasln = res.engymtrparmVo.phasln;// 相线
                            dataArr.mtrtyp = res.engymtrparmVo.mtrtyp;// 电能表类型
                            dataArr.nomcur = res.engymtrparmVo.nomcur;// 标定电流
                            dataArr.nomvolt = res.engymtrparmVo.nomvolt;// 额定电压
                        }
                        if (res.rgstparmVo) {
                            dataArr.mtrmult = res.rgstparmVo.mtrmult;// 表计倍率
                        }
                        if (res.vtparmVo) {
                            dataArr.volttranrati = res.vtparmVo.volttranrati;// 电压互感器变比
                        }
                        deferred.resolve(dataArr);
                    }
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询电能表厂家信息、出厂编号
             */
            queryEquipmentMaster: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryequipmentmasterdata/searchequipmasterdata'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var factoryInfo = {
                        manu: '',// 厂家信息
                        mnufctno: ''// 厂家编号
                    };
                    var result = res.voList.length > 0 ? res.voList[0] : factoryInfo;
                    factoryInfo.manu = result.manu;
                    factoryInfo.mnufctno = result.mnufctno;
                    deferred.resolve(factoryInfo);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询上下限示数、估读示数
             */
            queryUpDownReadList: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_MR_URL,
                    serviceName: 'estimatedReadingValue'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var upDownList = res || [];
                    deferred.resolve(upDownList);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询个人持有设备
             */
            queryOwnEquipment: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryHoldEquipList'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return zcgdblService;
    }
]);