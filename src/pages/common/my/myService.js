/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/8
 * 我的服务
 */
app.factory('myService', ['$hyHttp', '$q', '$rootScope', 'TFConstant', '$appConfig', '$hyUtil',
    function ($hyHttp, $q, $rootScope, TFConstant, $appConfig, $hyUtil) {
        var myService = {
            /**
             * 签到
             * @param location
             * @returns {Promise}
             */
            signIn: function (param) {
                param = param || {};
                var deferred = $q.defer();
                $hyHttp.appPost('yDGLService', {
                    'serviceName': 'workSign',
                    'jsonParams': JSON.stringify(param)
                }).then(function (data) {
                    var res = false;
                    if (data === 'setPosition success') {
                        res = true;
                    }
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 主动签到
             * @param location
             * @returns {*|Promise}
             */
            zdqd: function (location) {
                var param = {
                    'zh': $appConfig.userInfo.DLZH,
                    'dqbm': $appConfig.userInfo.DQBM,
                    'longi': location.lng,
                    'dimen': location.lat,
                    'address': location.address,
                    'type': location.type,
                    'signType': '1'//主动签到
                };
                return this.signIn(param);
            },
            /**
             * 查询上次签到信息
             * @returns {Promise}
             */
            lastSignQuery: function (param) {
                param = param || {
                    'zh': $appConfig.userInfo.DLZH,
                    'dqbm': $appConfig.userInfo.DQBM
                };
                var deferred = $q.defer();
                $hyHttp.appPost('yDGLService', {
                    'serviceName': 'retrieveLastPostion',
                    'jsonParams': JSON.stringify(param)
                }).then(function (data) {
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 获取账号时间线数据
             */
            getRetrieveWorkLine: function (zh, duration) {
                var param = {
                    'zh': zh || $appConfig.userInfo.DLZH,
                    'duration': duration
                };
                var deferred = $q.defer();
                $hyHttp.appPost('yDGLService', {
                    'serviceName': 'retrieveWorkLine',
                    'jsonParams': JSON.stringify(param)
                }).then(function (data) {
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 意见反馈
             * @param feedback
             * @returns {Promise}
             */
            yjfk: function (feedback) {
                var deferred = $q.defer();
                $hyHttp.appPost('tcAddService', {
                    'json_params': JSON.stringify({
                        'tjr': $appConfig.userInfo.RYBS,
                        'tjnr': feedback,
                        'tjrmc': $appConfig.userInfo.RYMC
                    })
                }).then(function (data) {
                    var res = false;
                    if (data && data.requestResult && data.requestResult.content === 'OK') {
                        res = true;
                    }
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 吐槽
             * @param feedback
             * @returns {Promise}
             */
            tc: function (feedback, fjbs) {
                var deferred = $q.defer();
                $hyHttp.appPost('yDGLService', {
                    'serviceName': 'QueryTcInfoRequest',
                    'jsonParams': JSON.stringify({
                        'tjr': $appConfig.userInfo.RYBS,
                        'tjnr': feedback,
                        'tjrmc': $appConfig.userInfo.RYMC,
                        'fjbs': fjbs
                    })
                }).then(function (data) {
                    var res = false;
                    if (data && data === 'OK') {
                        res = true;
                    }
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 清除缓存
             * @returns {Promise}
             */
            clearKb: function () {
                var count = 0;
                var tableNameList = TFConstant.tableNameList;
                var deferred = $q.defer();
                for (var i = 0; i < tableNameList.length; i++) {
                    tableNameList[i].all().destroyAll(function () {
                        count++;
                        persistence.flush();
                        if (count === tableNameList.length) {
                            deferred.resolve();
                        }
                    });
                }
                return deferred.promise;
            },
            /**
             * 修改密码
             * @returns {Promise}
             */
            xgmm: function (xmm) {
                var deferred = $q.defer();
                var params = {
                    serviceName: 'PasswordModifyService',
                    jsonParams: JSON.stringify({
                        'dlzh': appUserInfo.loginname,
                        'newPassword': xmm,
                        'dqbm': $appConfig.userInfo.DQBM,
                        'gddwbm': $appConfig.userInfo.GDDWBM,
                        'zzbm': $appConfig.userInfo.ZZBM
                    })
                };
                $hyHttp.appPost('yDGLService', params).then(function (data) {
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return myService;
    }
]);