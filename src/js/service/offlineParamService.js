/**
 * Created by lxj on 2020/09/04.
 * 保存离线工单信息到本地数据库
 */

app.factory('OfflineParamService', ['$filter', '$q',
    function ($filter, $q) {
        var service = {};

        /**
         * 保存离线工单信息
         * @param orderObj 工单详情信息
         * @param order 待办工单信息
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.saveOfflineParam = function (orderObj, order, flag) {
            var deferred = $q.defer();
            var sysCodeInfo = service.dealRequest(orderObj, order);
            if (sysCodeInfo && !sysCodeInfo.gzdbh) {
                return deferred.promise;
            }
            var sys_drop_code = new CEM_OFFLINE_PARAM_LIST({
                gzdbh: sysCodeInfo.gzdbh + flag,
                hjh: sysCodeInfo.hjh,
                wkflwtachno: sysCodeInfo.wkflwtachno,
                orderInfo: sysCodeInfo.orderInfo || '',
                localTime: $filter('date')(new Date(), 'yyyy-MM-dd')
            });
            service.getOfflineParam(sysCodeInfo.gzdbh + flag).then(function (value) {
                if (value) {
                    service.delOfflineParam(value.gzdbh).then(function () {
                        persistence.add(sys_drop_code);
                        persistence.flush(function () {
                            deferred.resolve('cache success');
                        });
                    });
                } else {
                    persistence.add(sys_drop_code);
                    persistence.flush(function () {
                        deferred.resolve('cache success');
                    });
                }
            }, function () {
                deferred.reject('cache failure');
            });
            return deferred.promise;
        };

        /**
         * 处理保存数据
         * @param orderInfo
         * @param order
         * @returns {{gzdbh: *, hjh: string, orderInfo: string}}
         */
        service.dealRequest = function (orderInfo, order) {
            return {
                gzdbh: order.wkordrno,
                hjh: order.wkflowstdtaskno.toString(),
                wkflwtachno: order.wkflwtachno.toString(),
                orderInfo: JSON.stringify(orderInfo)
            };
        };

        /**
         * 获取离线工单信息
         * @param gzdbh
         * @param localTime
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.getOfflineParam = function (gzdbh, localTime) {
            gzdbh = gzdbh || '';
            localTime = localTime || '';
            var deferred = $q.defer();
            var queryCollection = null;
            if (gzdbh) {
                queryCollection = CEM_OFFLINE_PARAM_LIST.all().filter('gzdbh', '=', gzdbh);
            } else {
                queryCollection = CEM_OFFLINE_PARAM_LIST.all().filter('localTime', '=', localTime);
            }
            queryCollection.list(function (results) {
                var resList = [];
                results.forEach(function (item) {
                    var obj = {
                        gzdbh: item.gzdbh,
                        hjh: item.hjh,
                        wkflwtachno: item.wkflwtachno,
                        orderInfo: item.orderInfo,
                        localTime: item.localTime
                    };
                    resList.push(obj);
                });
                var resultObj = null;
                if (gzdbh) {
                    resultObj = resList.length > 0 ? resList[0] : null;
                } else {
                    resultObj = resList;
                }
                deferred.resolve(resultObj);
            });

            return deferred.promise;
        };

        /**
         * 删除离线工单信息
         * @param gzdbh
         * @param localTime
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.delOfflineParam = function (gzdbh, localTime) {
            var deferred = $q.defer();
            if (gzdbh) {
                CEM_OFFLINE_PARAM_LIST.all().filter("gzdbh", '=', gzdbh).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
            } else if (localTime) {
                CEM_OFFLINE_PARAM_LIST.all().filter("localTime", '!=', localTime).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
            }
            return deferred.promise;
        };

        return service;
    }
]);
