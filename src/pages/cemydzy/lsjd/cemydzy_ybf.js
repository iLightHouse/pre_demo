/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/18
 * 電力裝置技術要求單
 */
app.controller("ydzyybfCtrl", ['$scope', '$onsen', 'TaskService', '$appConfig', '$hyUtil', 'ToolService', '$rootScope', '$filter', 'xcjcService',
    function ($scope, $onsen, TaskService, $appConfig, $hyUtil, ToolService, $rootScope, $filter, xcjcService) {
        $scope.jbxx = mainNavi.getCurrentPage().options.data || {}; // 接受上個頁面傳遞的數據
        $scope.orderType = mainNavi.getCurrentPage().options.orderType || '';// 工单状态 2已传递
        var keyStorage = "ybf" + $scope.jbxx.wkordrno;
        $scope.selectedLang = '中';
        $scope.langDrop = [{
            DMBMMC: "中",
            DMBM: "中"
        }, {
            DMBMMC: "En",
            DMBM: "En"
        }, {
            DMBMMC: "Pt",
            DMBM: "Pt"
        }];
        //其他信息
        $scope.otherXx = {
            'remindCn': '本人同意若於此次檢查後確實電錶運作正常，澳電將於下期電費單內收取澳門幣100元檢查費。如證實電錶運作異常，澳電將更換上址' +
            '之電錶並視乎實際情況於下期電費單內作電費調整。',
            'remindEn': 'I hereby agree for the term of charging MOP100 on the next bill if the meter is confirmed to be operating in normal ' +
            'condition after the execution of this meter testing. If the testing proves that the meter is running in abnormal conditions,' +
            'no charges will be applied with replacement of meter and consumption charge adjustment will be included in your next bill if any.',
            'remindPt': 'Eu, abaixo assinado, concordo com o pagamento de MOP100 a ser incluído na próxima factura, se se confirmar que o contador ' +
            'se encontra a operar normalmente após a verificação do contador. Se a verificação provar que o contador se encontra a funcionar em ' +
            'condições anormais, não será cobrada qualquer taxa na substituição do contador, e o ajustamento no valor do consumo será incluído na sua próxima factura, se houver.',
            'bz': ''
        };

        /**
         * 获取本地缓存中的备注
         */
        function init(){
            var localdata = $hyUtil.getLocal(keyStorage); //查询本地缓存数据
            if (!ToolService.isEmpty(localdata)) { //本地缓存数据存在使用本地缓存数据
                $scope.otherXx.bz = localdata.otherXx.bz; //其他信息
            }
        }

        init();

        /**
         * 电子签名初始化
         */
        $scope.signOnlybs = 'ybfdzqm_'+$scope.jbxx.wkordrno;
        var applysign;
        var khDate = '';
        function initSignHand() {
            TaskService.getFileByTask({}, {key: 'ONLYBS', value: $scope.signOnlybs}).then(function (list) {
                for (var i = 0; i < list.length; i++) {
                    var bz = JSON.parse(list[i].BZ);
                    switch (bz.bs) {
                        case 'KHYBF':
                            applysign = list[i];
                            $scope.khSign = {src: list[i].SRC, signDate: bz.date};
                            khDate = $filter('date')(bz.date,'yyyy-MM-dd HH:mm:ss');
                            break;
                    }
                }
            });
        }
        initSignHand();
        /**
         * 客户電子簽名方法
         * @param $image
         * @param $date
         */
        $scope.saveHandSign = function ($image, $date) {
            if (!$image.src) {
                TaskService.deleteFile(applysign);  //判断是否删除 删除本地数据；并把全局变量置空
                applysign = null;
                return;
            }
            if (applysign) {
                applysign.SRC = $image.src;
                applysign.ISUPLOAD = '0';
                applysign.BZ = JSON.stringify({date: new Date().getTime(),bs: 'KHYBF'});
                persistence.flush();
            } else {
                var time = new Date().getTime();
                var key = "SignApply" +time+".png";
                TaskService.saveFileLocal($image.src, {
                    GZDBH: $scope.jbxx.wkordrno,  //工作单编号
                    RWH: '',  //任务号
                    HJH: '', //环节号
                    YWLX: 'workOrder',  //类型
                    YWCLR: $appConfig.userInfo.RYBS,
                    BZ: JSON.stringify({date: new Date().getTime(),bs: 'KHYBF'}),  //备注
                    ENABLED: '1',
                    ISSTREAM: '1',
                    KEY:key,
                    ONLYBS: $scope.signOnlybs
                }).then(function (file) {
                    applysign = file;
                });
            }
            khDate = $filter('date')($date,'yyyy-MM-dd HH:mm:ss');
        };

        $scope.save = function () {
            // 保存签名成功后，接收一个成功标志，并传递给上一个界面
            // 如果选择现场任务类型为现场检验，则必须进行验表费签名，其他不强制；
            var param = createParam();
            hyMui.loaderShow();
            TaskService.uploadFileByTask({}, '', {key: 'ONLYBS', value: $scope.signOnlybs}).then(function(res){
                if(res && res instanceof Array && res.length>0){
                    for(var i = 0;i<res.length;i++){
                        if(res[i].fileName && res[i].fileName.indexOf('SignApply') > -1){
                            param.applysign = res[i].fileId+",50,30";
                        }
                    }
                }
                //若保存成功后，再次修改表单内容，但是未修改签名，再点保存电子签名不会再上传一次，返回res是空的，需要将之前电子签名fileId拿到
                if(!param.applysign){
                    TaskService.getFileByTask({}, {key: 'ONLYBS', value: $scope.signOnlybs}).then(function (list) {
                        for (var i = 0; i < list.length; i++) {
                            var bz = JSON.parse(list[i].BZ);
                            switch (bz.bs) {
                                case 'KHYBF':
                                    if(list[i].MBH){
                                        param.applysign = list[i].MBH+",50,30";
                                    }
                                    break;
                            }
                        }
                        //调用生成pdf服务
                        createPdf(param);
                    });
                }else{
                    //调用生成pdf服务
                    createPdf(param);
                }

            },function(res){
                hyMui.toast({message: '電子簽名上傳失敗'});
            });
        };

       function createPdf(param){
           xcjcService.saveYbfqmInfo(param).then(function (data) {
               hyMui.loaderHide();
               if (data.resultVo.rslt === '0') {
                   // 本地缓存备注
                   $hyUtil.saveLocal(keyStorage, {otherXx:{bz:$scope.otherXx.bz}});
                   hyMui.toast({message: "保存成功"});
                   $rootScope.$broadcast('CEMYDZY_YBF', 'success');
                   mainNavi.popPage();
               } else {
                   hyMui.toast({message: "保存失敗"});
               }
           }, function () {
               hyMui.loaderHide();
           });
       }
        function createParam() {
            return {
                "addr": $scope.selectedLang === '中' ? $scope.jbxx.detaaddr : $scope.jbxx.detaengladdr,
                "applyname": $scope.selectedLang === '中' ? $scope.jbxx.detaaddr : $scope.jbxx.custenglnm,
                "applyno":$scope.jbxx.wkordrno,
                "businessno": $scope.jbxx.wkordrno,
                "contractno": $filter('lengthenNumber')(12, $scope.jbxx.cntracctno),
                "date": $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                "meterno": $filter('lengthenNumber')(18, $scope.jbxx.asseno),
                "module": "workOrder+" + $appConfig.userInfo.RYBS,
                "rmk": $scope.otherXx.bz,
                "teleno": $scope.jbxx.ctctaddr,
                "templatecode": "APP_YBFBD"
            }
        }

    }]);