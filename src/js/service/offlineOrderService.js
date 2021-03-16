/**
 * Created by lxj on 2020/09/04.
 * 保存离线工单信息到本地数据库
 */

app.factory('OfflineOrderService', ['$filter', '$q',
    function ($filter, $q) {
        var service = {};

        /**
         * 保存离线工单信息
         * @param orderObj 工单详情信息
         * @param order 待办工单信息
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.saveOfflineOrder = function (orderObj, order, flag) {
            flag = flag || "";
            var deferred = $q.defer();
            var sysCodeInfo = service.dealRequest(orderObj, order);
            if (sysCodeInfo && !sysCodeInfo.gzdbh) {
                return deferred.promise;
            }
            var sys_drop_code = new CEM_OFFLINE_ORDER_LIST({
                gzdbh: sysCodeInfo.gzdbh + flag,
                hjh: sysCodeInfo.hjh,
                wkflwtachno: sysCodeInfo.wkflwtachno,
                orderInfo: sysCodeInfo.orderInfo || '',
                localTime: $filter('date')(new Date(), 'yyyy-MM-dd')
            });
            service.getOfflineOrder(sysCodeInfo.gzdbh + flag).then(function (value) {
                if (value) {
                    service.delOfflineOrder(value.gzdbh).then(function () {
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
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.getOfflineOrder = function (gzdbh) {
            gzdbh = gzdbh || '';
            var deferred = $q.defer();
            var queryCollection = CEM_OFFLINE_ORDER_LIST.all().filter('gzdbh', '=', gzdbh);
            queryCollection.list(function (results) {
                var resList = [];
                results.forEach(function (item) {
                    var obj = {
                        gzdbh: item.gzdbh,
                        orderInfo: item.orderInfo,
                        hjh: item.hjh,
                        wkflwtachno: item.wkflwtachno,
                        localTime: item.localTime
                    };
                    resList.push(obj);
                });
                var resultObj = resList.length > 0 ? resList[resList.length - 1] : null;
                deferred.resolve(resultObj);
            });
            return deferred.promise;
        };

        /**
         * 获取创建工单的所有工单信息
         * @param hjh
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.getOfflineOrderByHjh = function (hjh) {
            hjh = hjh || '';
            var deferred = $q.defer();
            var queryCollection = CEM_OFFLINE_ORDER_LIST.all().filter('hjh', '=', hjh);
            queryCollection.list(function (results) {
                var resList = [];
                results.forEach(function (item) {
                    var obj = {
                        gzdbh: item.gzdbh,
                        orderInfo: item.orderInfo,
                        hjh: item.hjh,
                        wkflwtachno: item.wkflwtachno,
                        localTime: item.localTime
                    };
                    resList.push(obj);
                });
                deferred.resolve(resList);
            });
            return deferred.promise;
        };

        /**
         * 删除离线工单信息
         * @param gzdbh
         * @param localTime
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.delOfflineOrder = function (gzdbh, localTime) {
            var deferred = $q.defer();
            if (gzdbh) {
                CEM_OFFLINE_ORDER_LIST.all().filter("gzdbh", '=', gzdbh).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
            } else if (localTime) {
                CEM_OFFLINE_ORDER_LIST.all().filter("localTime", '!=', localTime).list(function (results) {
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

        /**
         * 离线获取本地数据的提示
         * @param state 网络状态 local 获取本地 offline 请求超时
         * @param succOrfail success成功 fail失败
         * @returns {string}
         */
        service.getNetWorkMessage = function (state, succOrfail) {
            var message = '';
            if (succOrfail === 'success') {
                message = state === 'local' ? '獲取本地數據成功' : '網絡異常，獲取本地數據成功';
            } else {
                message = state === 'local' ? '暫無本地數據獲取,請重試' : '網絡異常，暫無本地數據獲取,請重試';
            }
            return message;
        };

        return service;
    }
]);
