/**
 * Created by keyu on 2017/8/25.
 * 获取登录用户信息
 */
app.factory('YxUserService',  ['$rootScope', '$hyHttp','$appConfig', '$q',
    function ($rootScope,$hyHttp,$appConfig,$q) {
        var service = {
            /**
             * ws获取用户信息
             */
            getYxUserInfo: function (username) {
                var deferred = $q.defer();
                if(!username){
                    deferred.reject();
                    return deferred.promise;
                }
                var params = {
                    serverName:'QuerySystemPerInfo',
                    rc_head:'querySystemPerInfoRequest',
                    rc_body:JSON.stringify({
                        SystemPerInfoInType:{
                            dlzh:username
                        }
                    })
                };
                $hyHttp.appPost('webService', params)
                    .then(function (data) {
                        var user = data.SystemPerInfoOutType;
                        if(!user || !user.DLZH) {
                            deferred.reject();
                        }else{
                            $appConfig.saveUserInfo(user);
                            deferred.resolve(data);
                        }
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            }
        };

        return service;
    }]
);
