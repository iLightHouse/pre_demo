app.factory('homeService', ['$hyHttp', '$q', 'TFConstant',
    function ($hyHttp, $q, TFConstant) {
        var homeService = {
            /**
             * 查询首页个人待办
             */
            queryGrdbOrderList: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryTaskList'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    var dataArr = {
                        voList: res.voList || [],
                        resultVo: res.resultVo || {}
                    };
                    deferred.resolve(dataArr);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 保存停电下载时间
             */
            saveDownloadTime: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    // url: 'http://172.20.32.153:8888/DrService/RP/service/',//开发环境用这个地址
                    url: TFConstant.KF_RP_URL,//集成环境用这个地址
                    serviceName: 'saveDownloadTimeOfDisconAndRcnnTask'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 定时上传经纬度
             */
            saveLocationTime: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_MR_URL,
                    serviceName: 'saveHandholdMovingTrajectory'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return homeService;
    }
]);