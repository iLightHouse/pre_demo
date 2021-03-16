/**
 * Created by lxj on 2020/06/03.
 * 保存传递工单信息到本地数据库
 */

app.factory('PassOrderService', ['$filter', '$q',
    function ($filter, $q) {
        var service = {};

        /**
         * 保存传递工单信息
         * @param orderObj 工单详情信息
         * @param order 待办工单信息
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.savePassOrder = function (orderObj, order,flag) {//flag標誌用於故障處理和臨時檢定工單緩存,gzcl，lsjd
            flag = flag || "";
            var deferred = $q.defer();
            var sysCodeInfo = service.dealRequest(orderObj, order);
            if (sysCodeInfo && !sysCodeInfo.gzdbh) {
                return deferred.promise;
            }
            var sys_drop_code = new CEM_PASS_ORDER_LIST({
                gzdbh: sysCodeInfo.gzdbh + flag,
                hjh: sysCodeInfo.hjh,
                orderInfo: sysCodeInfo.orderInfo || '',
                localTime: $filter('date')(new Date(), 'yyyy-MM-dd')
            });
            service.getPassOrder(sysCodeInfo.gzdbh + flag).then(function (value) {
                if (value) {
                    service.delPassOrder(value.gzdbh).then(function () {
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
                orderInfo: JSON.stringify(orderInfo)
            };
        };

        /**
         * 获取传递工单信息
         * @param gzdbh
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.getPassOrder = function (gzdbh) {
            gzdbh = gzdbh || '';
            var deferred = $q.defer();
            var queryCollection = CEM_PASS_ORDER_LIST.all().filter('gzdbh', '=', gzdbh);
            queryCollection.list(function (results) {
                var resList = [];
                results.forEach(function (item) {
                    var obj = {
                        gzdbh: item.gzdbh,
                        orderInfo: item.orderInfo,
                        localTime: item.localTime
                    };
                    resList.push(obj);
                });
                var resultObj = resList.length > 0 ? resList[0] : null;
                deferred.resolve(resultObj);
            });
            return deferred.promise;
        };

        /**
         * 删除传递工单信息
         * @param gzdbh
         * @param localTime
         * @returns {PromiseLike<{}> | Promise | s}
         */
        service.delPassOrder = function (gzdbh, localTime) {
            var deferred = $q.defer();
            if (gzdbh) {
                CEM_PASS_ORDER_LIST.all().filter("gzdbh", '=', gzdbh).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
            } else if (localTime) {
                CEM_PASS_ORDER_LIST.all().filter("localTime", '!=', localTime).list(function (results) {
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
