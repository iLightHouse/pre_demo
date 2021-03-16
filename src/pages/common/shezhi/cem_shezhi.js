/**
 * Version:1.0.0
 * Author:lxj
 * Date:2019/05/16
 * 設置
 */
app.controller("cemshezhiCtrl", ['$scope', '$onsen', '$hyUtil', 'TFConstant', function ($scope, $onsen, $hyUtil, TFConstant) {
    var ms = 0;// 毫秒值
    var reminderMs = 0;// 预约提醒时间
    TFConstant.LOCAL_ORDERAPI_TIME = 'ydzy_local_order_time';
    TFConstant.LOCAL_REMINDER_TIME = 'ydzy_local_remind_time';
    TFConstant.LOCAL_NETWORK_TIME = 'ydzy_local_network_time';
    var keyStorage = TFConstant.LOCAL_ORDERAPI_TIME;
    var appointmentReminderTime = TFConstant.LOCAL_REMINDER_TIME;// 预约提醒时间
    var netWorkTime = TFConstant.LOCAL_NETWORK_TIME;// 網絡請求超時時間


    function init() {
        $scope.uuid = window.device && window.device.uuid;
        var localdata = $hyUtil.getLocal(keyStorage); // 查询自动接收时间缓存数据
        $scope.zdjssj = (localdata && localdata.zdjssj) || '3';
        var reminderTime = $hyUtil.getLocal(appointmentReminderTime); // 查询预约提醒时间缓存数据
        $scope.yytxsj = (reminderTime && reminderTime.yytxsj) || '60';
        var outTime = $hyUtil.getLocal(netWorkTime); // 查询網絡請求超時時間
        if (typeof outTime === 'string') {
            outTime = Number(outTime);
        }
        $scope.wlcssj = outTime || 30000;
    }

    init();

    $scope.save = function () {
        // 自动接收时间
        var time = {
            zdjssj: $scope.zdjssj,
            ms: ms
        };
        $hyUtil.saveLocal(keyStorage, time);
        var reminder = {
            yytxsj: $scope.yytxsj
        };
        $hyUtil.saveLocal(appointmentReminderTime, reminder);
        var network = $scope.wlcssj || 30000;
        $hyUtil.saveLocal(netWorkTime, network);
        hyMui.alert("更改成功", function () {
            mainNavi.popPage();
        });
    };

    $scope.changeTimeToMs = function (value) {
        if (!value) {
            ms = 0;
        } else {
            ms = Number(value) * 60 * 1000;
        }
    };

    /*$scope.changeReminderToMs = function (value) {
        if (!value) {
            reminderMs = 0;
        }else {
            reminderMs = Number(value) * 1000;
        }
    };*/

    $scope.jsrwDrop = [{
        DMBMMC: "3 min",
        DMBM: "3"
    }, {
        DMBMMC: "5 min",
        DMBM: "5"
    }, {
        DMBMMC: "10 min",
        DMBM: "10"
    }, {
        DMBMMC: "20 min",
        DMBM: "20"
    }, {
        DMBMMC: "30 min",
        DMBM: "30"
    }];
    $scope.yytxDrop = [{
        DMBMMC: "10 min",
        DMBM: "10"
    }, {
        DMBMMC: "20 min",
        DMBM: "20"
    }, {
        DMBMMC: "30 min",
        DMBM: "30"
    }, {
        DMBMMC: "1 h",
        DMBM: "60"
    }];
    $scope.wlcssjDrop = [{
        DMBMMC: "20 s",
        DMBM: 20000
    }, {
        DMBMMC: "30 s",
        DMBM: 30000
    }, {
        DMBMMC: "40 s",
        DMBM: 40000
    }, {
        DMBMMC: "50 s",
        DMBM: 50000
    }, {
        DMBMMC: "1 min",
        DMBM: 60000
    }];
}]);