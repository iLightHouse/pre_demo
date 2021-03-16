/**
 * 匹配管理账号
 * 曲立义
 */


app.factory('matchAccountService', ['$q', '$hyHttp',
    function ($q, $hyHttp) {
        var matchAccountService = {
            queryManagerAccount: function (paramInfo) {
                var deferred = $q.defer();
                $hyHttp.appPost('yDGLService', {
                    'serviceName': 'MatchManagerAccount',
                    'jsonParams': JSON.stringify({
                        account: paramInfo.account
                    })
                }).then(function (data) {
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            }
        };
        return matchAccountService;
    }]);