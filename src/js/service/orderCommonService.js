/**
 * Created by 刘克玉 on 2017/09/13.
 * 保存照片到本地数据库
 */

app.factory('OrderCommonService', ['$filter', '$q', 'OfflineOrderService', 'OfflineParamService', 'ToolService', '$rootScope',
    function ($filter, $q, OfflineOrderService, OfflineParamService, ToolService, $rootScope) {

        var service = {};

        /**
         * 离线缓存工单信息和入参
         * @param orderInfo 工单详情信息
         * @param order 待办工单信息
         * @param param 入参
         * @param photoKey 照片
         */
        service.saveOrderAndParam = function (orderInfo, order, param, photoKey, flag) {
            flag = flag || "";
            // 1.工单信息保存至本地数据库
            OfflineOrderService.saveOfflineOrder(orderInfo, order, flag);
            // 2.保存入参保存至本地数据库
            if (param) {
                OfflineParamService.saveOfflineParam(param, order, flag);
            }
            // 3.緩存照片photoKey
            ToolService.saveLocalPhotoKey(photoKey);
            // 4.工单移动
            order.orderType = '1';// 工单状态，1.已保存 2.已传递
            order.offLineState = true;// 离线工单
            order.localTime = $filter('date')(new Date(), 'yyyy-MM-dd');
            $rootScope.$broadcast("CHANGE_SAVE_ORDER", order);
            if (param) {
                hyMui.toast({message: '網絡異常，本地數據保存成功'});
            }
        };

        return service;
    }
]);
