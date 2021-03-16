/**
 * Version:1.0.0
 * Author:lxj
 * Date:2020/03/12
 * 檢查項目
 */
app.controller("cemjcxmCtrl", ['$scope', '$rootScope', '$filter', 'systemDropList',
    function ($scope, $rootScope, $filter, systemDropList) {
        // 按道理要copy出来，因为用户可能点击回退按钮，这样界面填过的数据也会同步更新到上一个界面中的对象里
        var param = mainNavi.getCurrentPage().options.param;// 入参对象
        var xmList = param.jcxmList;// 所有的设备清单对象的检查项目数组
        var flag = param.flag;// 系统 新增标记
        $scope.jcxmItem = param.item;// 设备清单对象
        $scope.title = param.index;// 现场任务类型为现场检验（'3'），则标题改为检验项目  fldtsktyp根据此标记修改标题
        $scope.ownXmList = [];// 当前设备检查项目数组

        function init() {
            // 筛选当前设备的检查项目：系统（equiplstid） 新增（asseno）
            if (flag === 'xt') {
                $scope.ownXmList = xmList.filter(function (item) {
                    if (item.equiplstid === $scope.jcxmItem.equiplstid) {
                        return item;
                    }
                });
            } else if (flag === 'xz') {
                $scope.ownXmList = xmList.filter(function (item) {
                    if (item.asseno === $scope.jcxmItem.asseno) {
                        return item;
                    }
                });
            }
            // 翻译检查项目
            for (var i = 0; i < $scope.ownXmList.length; i++) {
                !function (i) {
                    systemDropList.getDropLable('EQUITSTITMCD', $scope.ownXmList[i].chkitmcd).then(function (label) {
                        $scope.ownXmList[i].chkitmcdMc = label || $scope.ownXmList[i].chkitmcd;
                    });
                }(i)
            }
            // 检查时间赋默认值 fldinspdt
            if (!$scope.jcxmItem.tskfnshdt) {
                $scope.jcxmItem.tskfnshdt = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            }
            $scope.jcjgDrop = [{
                DMBMMC: "合格",
                DMBM: "01"
            }, {
                DMBMMC: "不合格",
                DMBM: "00"
            }];
            // 处理方式
            $scope.clfsDrop = [{
                DMBMMC: "現場處理",
                DMBM: "01"
            }, {
                DMBMMC: "更換設備",
                DMBM: "02"
            }, {
                DMBMMC: "更換設備(室内檢定)",
                DMBM: "03"
            }];
            /*systemDropList.getDropInfoList('HANDMDECD').then(function (list) {
                $scope.clfsDrop = list;
            });*/
        }

        init();

        /**
         * 将此页面数据传递到上一个页面
         */
        $scope.saveJcxm = function () {
            if (!$scope.jcxmItem.fldinspconc) {
                hyMui.alert('請填寫檢查結果');
                return
            }
            for (var i = 0; i < $scope.ownXmList.length; i++) {
                if(!$scope.ownXmList[i].chkitmconc){
                    hyMui.alert('請選擇檢查項目結論');
                    return
                }
            }
            /*jcxmCopy.SFGH = $scope.SFGH;
            jcxmCopy.JCQR = $scope.JCQR;
            jcxmCopy.CLYJ = $scope.CLYJ;
            jcxmCopy.CLFS = $scope.CLFS;
            jcxmCopy.JCJG = $scope.JCJG;
            $rootScope.$broadcast("CEMJCXM_JCXM", jcxmCopy);*/
            mainNavi.popPage();
        }
    }]);