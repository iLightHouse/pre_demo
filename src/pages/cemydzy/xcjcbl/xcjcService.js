app.factory('xcjcService', ['$hyHttp', '$q', '$rootScope', '$hyUtil', '$appConfig', 'TFConstant',
    function ($hyHttp, $q, $rootScope, $hyUtil, $appConfig, TFConstant) {
        var xcjcService = {
            /**
             * 查询现场检查工单详情
             */
            queryXcjcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'querySceneCheckEntity/querySceneCheckEntity'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        jcxmList: res.list || [],
                        infoVo: res.scenecheckentitylVo || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存现场检查工单
             */
            saveXcjcOrderInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_CS_URL,
                    serviceName: 'appSaveSceneCheckEntity'
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
             * 保存電力裝置技術要求單
             */
            saveDlzzjsyqdInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_FRAME_URL,
                    serviceName: 'saveCSAppDlzzjsyqd'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        resultVo: res.resultVo || {},
                        file: res.file || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存驗錶費簽名
             */
            saveYbfqmInfo: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_FRAME_URL,
                    serviceName: 'saveDMAppYbfbd'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        resultVo: res.resultVo || {},
                        file: res.file || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 發送郵件
             */
            sendEmail: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_FRAME_URL,
                    serviceName: 'emailSending/sendEmail'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 生成二維碼
             */
            createEwm: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url:"http://172.20.195.210:8888/ccsmobile/file/",
                    // url: TFConstant.KF_FRAME_URL,
                    serviceName: 'register/'+params.fileId
                    // serviceName: 'register'
                };
                if(connectionType == 2){
                    serviceUrl.serviceName = 'register';
                }
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return xcjcService;
    }
]);