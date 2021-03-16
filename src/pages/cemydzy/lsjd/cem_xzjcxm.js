/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/13
 * 臨時檢定-新增項目
 */
app.controller("cemxzxmCtrl", ['$scope', 'NativeService', '$http', '$rootScope', 'lsjdService', 'systemDropList', '$filter', function ($scope, NativeService, $http, $rootScope, lsjdService, systemDropList, $filter) {
    var task = mainNavi.getCurrentPage().options.task || {};// 工作单编号、合约账户
    $scope.flag = false;// 是否有數據
    $scope.updown = true;// 初始化時展開
    $scope.query = {
        equiclas: '01'
    };
    $scope.resultList = [];// 查询出来的数据
    var queryList = [];

    $scope.sblbDrop = [{
        DMBMMC: "電能表",
        DMBM: "01"
    }, {
        DMBMMC: "互感器",
        DMBM: "02"
    }];

    /**
     * 初始化
     * （1）接口返回设备列表、检查项目列表，通过资产编号关联
     * （2）初始化：查询设备列表、检查项目列表，翻译设备列表中的字段并展示到界面上
     */
    function init() {
        var param = {
            "appTemporaryinVO": {
                "asseno": $scope.query.asseno,
                "contractno": $filter('lengthenNumber')(12, task.cntracctno),
                "equiclas": '',
                "wkordrno": task.wkordrno
            },
            "pageInfo": {
                "allPageNum": 0,
                "allRowNum": 0,
                "curPageNum": 1,
                "rowOfPage": 100
            }
        };
        hyMui.loaderShow();
        lsjdService.queryXcjcSbList(param).then(function (data) {
            hyMui.loaderHide();
            $scope.sbList = data.sbList;// 設備列表
            $scope.sbList.forEach(function (item) {
                item.asseno = $filter('shortenNumber')(item.asseno);// 去零
            });
            // createData(data);// 构造假数据
            $scope.jcxmList = data.jcxmList;// 檢查項目
            queryList = angular.copy($scope.sbList);// 用于搜索
            $scope.queryXzxm();
        }, function () {
            hyMui.loaderHide();
        });
    }

    init();

    /**
     * 复选框选择，点击效果+去重
     * 增加一个标识，代表选中，用到选中的数据时，用这个标识进行判断
     * @type {Array}
     */
    var checkSpxx = [];
    $scope.pgSelected = function (item) {
        item.isSel = !item.isSel;
        if (!item) {
            return;
        }
        var index = checkSpxx.indexOf(item);//获取每一个item的位置
        //判断item是否存在数组
        if (index >= 0) { //存在的话点击会移出数组
            checkSpxx.splice(index, 1);
        } else {
            checkSpxx.push(item);
        }
    };

    /**
     *  选中设备传递到上一个界面：
     *    a.传递的参数有：选中的设备数组、设备对应的检查项目数组
     *    b.筛选出设备对应的检查项目数组（包含多个设备的检查项目）
     *    c.发送广播将两个数组传递到上一个界面
     *    注：增加新增标记 changeflag 1 为新增
     */
    $scope.confirmSb = function () {
        var nowJcxm = [];
        for (var i = 0; i < checkSpxx.length; i++) {
            checkSpxx[i].changeflag = '1';
            for (var j = 0; j < $scope.jcxmList.length; j++) {
                if (checkSpxx[i].asseno === $scope.jcxmList[j].asseno) {
                    // $scope.jcxmList[j].equiplstid = checkSpxx[i].equiplstid; 设备清单标识（非必传）
                    nowJcxm.push($scope.jcxmList[j])
                }
            }
        }
        var sbObj = {
            sb: checkSpxx,// 设备
            jcxm: nowJcxm // 设备下的检查项目
        };
        $rootScope.$broadcast('CEMJCXM_XCSB', sbObj);
        mainNavi.popPage();
    };

    /**
     * 搜索
     */
    $scope.queryXzxm = function () {
        $scope.sbList = queryBucondition(queryList);
        for (var i = 0; i < $scope.sbList.length; i++) {
            (function (i) {
                // 翻译设备类别
                systemDropList.getDropLable('EQUICLASCD', $scope.sbList[i].equiclas).then(function (label) {
                    $scope.sbList[i].equiclasMc = label || $scope.sbList[i].equiclas;
                });
                // 翻译设备类型
                systemDropList.getDropLable('EQUITYPCD', $scope.sbList[i].equityp).then(function (label) {
                    $scope.sbList[i].equitypMc = label || $scope.sbList[i].equityp;
                });
            }(i));
        }
        $scope.updown = false;
    };

    /**
     * 筛选数据
     * @param list
     * @returns {*}
     */
    function queryBucondition(list) {
        return list.filter(function (item) {
            if ((!$scope.query.equiclas || $scope.query.equiclas === item.equiclas) && (!$scope.query.asseno || (item.asseno.indexOf($scope.query.asseno) !== -1))) {
                return item
            }
        });
        // return resultLists;
    }

    /**
     * 扫一扫資產編號
     */
    $scope.scanZcbh = function () {
        NativeService.scan().then(function (data) {
            $scope.query.asseno = data;
        });
    };

}]);