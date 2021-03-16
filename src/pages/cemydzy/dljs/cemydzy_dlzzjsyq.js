/**
 * Version:1.0.0
 * Author:lxz
 * Date:2020/03/17
 * 電力裝置技術要求單
 */
app.controller("dlzzjsyqCtrl", ['$scope', '$onsen', 'TaskService', 'xcjcService','$appConfig', '$filter', '$hyUtil', 'ToolService',
    function ($scope, $onsen, TaskService,xcjcService, $appConfig, $filter, $hyUtil, ToolService) {
        $scope.jbxx = mainNavi.getCurrentPage().options.jbxx || {};//測試數據;
        $scope.orderType = mainNavi.getCurrentPage().options.orderType || '';// 工单状态 2已传递
        $scope.selectedLang = '中';
        var keyStorage = "dlzzjsyqd_" + $scope.jbxx.wkordrno;
        $scope.emailFlag = false;// 默认发送邮件按钮不可用
        var pdffileId = "";
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

        /**
         * 初始化方法
         */
        function init() {
            var localdata = $hyUtil.getLocal(keyStorage); //查询本地缓存数据
            if (!ToolService.isEmpty(localdata)) { //本地缓存数据存在使用本地缓存数据
                $scope.otherXx = localdata.otherXx; //其他信息
                $scope.khgcList = localdata.khgcList;//客户工程列表
                $scope.dxList = localdata.dxList; //电线列表
                if (localdata.static === 'success') {
                    pdffileId = localdata.pdffileId || "";
                    $scope.emailFlag = true;// 已保存过则可以发送邮件
                }
            } else {
                //其他信息
                $scope.otherXx = {
                    'remindCn': '因客戶未能到場配合檢查裝置，故上址所需工程可應現場實際情況有所變更，詳情可致電咨詢通熱線查詢。',
                    'remindEn': 'Changes may incur accordingly due to customer unavailablity for onsite equipment checks.\n' +
                    'Please call info Line for details.',
                    'remindPt': 'Poderão ocorrer alterações devido  à indisponibilidade to cliente para verificações de equipamento no local.Por \n' +
                    ' favor,ligue para aLinha info para mais informaçõe.',
                    'bz': '',
                    'check': ''
                };
                //客戶工程列表
                $scope.khgcList = [{ //需進行的客戶工程列表
                    'type': '1',
                    'titleCn': '上升線分線箱和保險絲',
                    'titleEn': 'CCL with Fuse',
                    'titlePt': 'Caixa de Colunas com Fusível',
                    'rep': '',
                    'ins': '',
                    'am': '',
                    'gg': '',
                    'ap': ''
                }, {
                    'type': '1',
                    'titleCn': '大廈分線箱和保險絲',
                    'titleEn': 'CPS with Fuse',
                    'titlePt': 'Caixa de Protecção de Saídas(CPS) com Fusível',
                    'rep': '',
                    'ins': '',
                    'am': '',
                    'gg': '',
                    'ap': ''
                }, {
                    'type': '2',
                    'titleCn': '總掣箱和總掣',
                    'titleEn': 'QG or QC with Main Switch',
                    'titlePt': 'Quadro Geral (QG) ou Quadro de colunas(QC) com Interruptor de Crote Geral',
                    'rep': '',
                    'ins': '',
                    'ap': ''
                }, {
                    'type': '3',
                    'titleCn': '電錶板',
                    'titleEn': 'Meter Board',
                    'titlePt': 'Caixa de Contadores',
                    'rep': '',
                    'ins': '',
                    'type1': '',
                    'type2': '',
                    'area': ''
                }, {
                    'type': '4',
                    'titleCn': '電流互感器箱',
                    'titleEn': 'CT Chamber',
                    'titlePt': 'Compartimento para Transformador de Intensidade (TI)',
                    'ins': ''
                }, {
                    'type': '4',
                    'titleCn': '線頭箱和接地',
                    'titleEn': 'Pothead and Earthing',
                    'titlePt': 'Portinhola e Sistema de Terra',
                    'ins': ''
                }];
                //電線列表
                $scope.dxList =
                    [{
                        'type': '1',
                        'titleCn': '線頭箱上升線',
                        'titleEn': 'Rising Cable From PH',
                        'titlePt': 'Cabo de  Saída da Portinhola',
                        'check': '',
                        'model': ''
                    },
                        {
                            'type': '1',
                            'titleCn': '由總掣至大廈分線箱',
                            'titleEn': 'From Main Switch to CPS',
                            'titlePt': 'Do interruptor de Crote Geral para a Caixa de Protecção de Saídas',
                            'check': '',
                            'model': ''
                        },
                        {
                            'type': '1',
                            'titleCn': '由大廈分線箱至上升線分線箱',
                            'titleEn': 'From CPS to CCL',
                            'titlePt': 'Da Caixa de Protecção de Saídas para a  Caixa de Colunas',
                            'check': '',
                            'model': ''
                        },
                        {
                            'type': '1',
                            'titleCn': '由上升線分線箱至限流器（跳掣）',
                            'titleEn': 'From CCL to MCB',
                            'titlePt': 'Da Caixa de Colunas para o Disjuntor',
                            'check': '',
                            'model': ''
                        },
                        {
                            'type': '1',
                            'titleCn': '由限流器（跳掣）至電錶',
                            'titleEn': 'From MCB to Meter',
                            'titlePt': 'Da Disjuntor para o Contador',
                            'check': '',
                            'model': ''
                        },
                        {
                            'type': '1',
                            'titleCn': '由電錶至室內',
                            'titleEn': 'From Meter to Customer\'s Premises',
                            'titlePt': 'Do Contador para a Instalação do Cliente',
                            'check': '',
                            'model': ''
                        },
                        {
                            'type': '2',
                            'titleCn': '線色',
                            'titleEn': 'Cable Color',
                            'titlePt': 'Cor do Cabo',

                            'color1Cn': '咖',
                            'color1En': 'Brown',
                            'color1Pt': 'Castanho',
                            'check1': '',
                            'color2Cn': '黑',
                            'color2En': 'Black',
                            'color2Pt': 'Preto',
                            'check2': '',
                            'color3Cn': '灰',
                            'color3En': 'Grey',
                            'color3Pt': 'Cinzento',
                            'check3': '',
                            'color4Cn': '藍',
                            'color4En': 'Blue',
                            'color4Pt': 'Azul',
                            'check4': '',
                            'color5Cn': '黃綠',
                            'color5En': 'Yellow Green',
                            'color5Pt': 'Verde Amarelo',
                            'check5': ''
                        },
                        {
                            'type': '3',
                            'titleCn': '接駁錶位線至原相位',
                            'titleEn': 'Connect metering cable to original phase',
                            'titlePt': 'Ligar a cabo de Ligação ao contador à fase original',
                            'check': '',
                            'model': ''
                        },
                        {
                            'type': '3',
                            'titleCn': '可以開鎖換表位線',
                            'titleEn': 'Can unseal to replace metering cable',
                            'titlePt': 'Pode remover o selo para Subsituição do cabo de ligação ao contador',
                            'check': '',
                            'model': ''
                        }];

            }
        }

        init();

        function changeSign(value) {
            return value ? '☑' : '▢'
        }

        /**
         * 保存方法
         */
        var secData;
        $scope.save = function () {
            secData = {
                'khgcList': $scope.khgcList,
                'dxList': $scope.dxList,
                'otherXx': $scope.otherXx
            };
            var param = createPara();
            hyMui.loaderShow();
            TaskService.uploadFileByTask({}, '', {key: 'ONLYBS', value: $scope.signOnlybs}).then(function(res){
                if(res && res instanceof Array && res.length>0){
                    for(var i = 0;i<res.length;i++){
                        if(res[i].fileName && res[i].fileName.indexOf('SignCA') > -1){
                            param.customersign = res[i].fileId+",50,30";
                        }
                        if(res[i].fileName && res[i].fileName.indexOf('SignCEM') > -1){
                            param.cemsign = res[i].fileId+",50,30";
                        }
                    }
                }
                //若保存成功后，再次修改表单内容，但是未修改签名，再点保存电子签名不会再上传一次，返回res是空的，需要将之前电子签名fileId拿到
                if(!param.customersign || !param.cemsign){
                    TaskService.getFileByTask({}, {key: 'ONLYBS', value: $scope.signOnlybs}).then(function (list) {
                        for (var i = 0; i < list.length; i++) {
                            var bz = JSON.parse(list[i].BZ);
                            switch (bz.bs) {
                                case 'KHDLZZ':
                                    if(list[i].MBH){
                                        param.customersign = list[i].MBH+",50,30";
                                    }
                                    break;
                                case 'CEMDLZZ':
                                    if(list[i].MBH){
                                        param.cemsign = list[i].MBH+",50,30";
                                    }
                                    break;
                            }
                        }
                        creatPdf(param);
                    });
                }else{
                    creatPdf(param);
                }

            },function(res){
                hyMui.toast({message: '電子簽名上傳失敗'});
            });
        };
        //调用上传业务数据服务
        function creatPdf(param){
            //调用生成pdf服务
            xcjcService.saveDlzzjsyqdInfo(param).then(function (data) {
                hyMui.loaderHide();
                if (data.resultVo.rslt === '0') {
                    if(data.file && data.file.fileId){
                        pdffileId = data.file.fileId;//生成pdf的fileId
                    }
                    secData.status = 'success';
                    secData.pdffileId = pdffileId;
                    $hyUtil.saveLocal(keyStorage, secData);
                    hyMui.toast({message: '保存成功'});
                    $scope.emailFlag = true;// 保存成功则发送邮件按钮可用
                } else {
                    pdffileId = "";
                    hyMui.toast({message: '保存失敗'});
                    $scope.emailFlag = false;// 保存失败则发送邮件按钮不可用
                }
            }, function () {
                hyMui.loaderHide();
            });
        }
        function createPara() {
            var resObj = {
                applyno: $scope.jbxx.wkordrno,
                businessno: $scope.jbxx.wkordrno
            };
            // 需要進行的客戶工程
            for (var i = 0; i < $scope.khgcList.length; i++) {
                switch (i) {
                    case 0:
                        resObj.rep1 = changeSign($scope.khgcList[0].rep);
                        resObj.ins1 = changeSign($scope.khgcList[0].ins);
                        resObj.gg1 = changeSign($scope.khgcList[0].gg);
                        resObj.am1 = changeSign($scope.khgcList[0].am);
                        resObj.dl1 = $scope.khgcList[0].ap;
                        break;
                    case 1:
                        resObj.rep2 = changeSign($scope.khgcList[1].rep);
                        resObj.ins2 = changeSign($scope.khgcList[1].ins);
                        resObj.gg2 = changeSign($scope.khgcList[1].gg);
                        resObj.am2 = changeSign($scope.khgcList[1].am);
                        resObj.dl2 = $scope.khgcList[1].ap;
                        break;
                    case 2:
                        resObj.rep3 = changeSign($scope.khgcList[2].rep);
                        resObj.ins3 = changeSign($scope.khgcList[2].ins);
                        resObj.am3 = $scope.khgcList[2].ap;
                        break;
                    case 3:
                        resObj.rep4 = changeSign($scope.khgcList[3].rep);
                        resObj.ins4 = changeSign($scope.khgcList[3].ins);
                        resObj.am4 = changeSign($scope.khgcList[3].type1);
                        resObj.am5 = changeSign($scope.khgcList[3].type2);
                        resObj.am6 = $scope.khgcList[3].area;
                        break;
                    case 4:
                        resObj.ins5 = changeSign($scope.khgcList[4].ins);
                        break;
                    case 5:
                        resObj.ins6 = changeSign($scope.khgcList[5].ins);
                        break;
                }
            }
            // 电线
            for (var j = 0; j < $scope.dxList.length; j++) {
                var lk = 'lk' + (j + 1);
                var mm = 'mm' + (j + 1);
                if (j < 6) {
                    resObj[lk] = changeSign($scope.dxList[j].check);
                    resObj[mm] = $scope.dxList[j].model;
                } else if (j === 6) {
                    resObj.lk7 = changeSign($scope.dxList[6].check);
                    resObj.color1 = changeSign($scope.dxList[6].check1);
                    resObj.color2 = changeSign($scope.dxList[6].check2);
                    resObj.color3 = changeSign($scope.dxList[6].check3);
                    resObj.color4 = changeSign($scope.dxList[6].check4);
                    resObj.color5 = changeSign($scope.dxList[6].check5);
                } else {
                    resObj[lk] = changeSign($scope.dxList[j].check);
                }
            }
            // 其他
            resObj.ot = changeSign($scope.otherXx.check);
            resObj.other = $scope.otherXx.bz;
            resObj.installaddr = $scope.jbxx.detaaddr;
            resObj.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            resObj.module = 'workOrder+' + $appConfig.userInfo.RYBS;//上传人
            resObj.templatecode = 'APP_DLZZJSYQD';
            resObj.number = '00003001';

            return resObj;
        }


        /**
         * 拼接接口入参
         * @param    保存借口入参格式
         * @returns
         */
        var data = {
            'a': '',
            'b': [{}, {}],
            'c': [{}, {}]
        };
        /**
         * 电子签名初始化
         */
        $scope.signOnlybs = 'dzqm_'+$scope.jbxx.wkordrno;
        var khSign;
        var cemSign;
        var khDate = '';
        var cemDate = '';
        function initSignHand() {
            TaskService.getFileByTask({}, {key: 'ONLYBS', value: $scope.signOnlybs}).then(function (list) {
                for (var i = 0; i < list.length; i++) {
                    var bz = JSON.parse(list[i].BZ);
                    switch (bz.bs) {
                        case 'KHDLZZ':
                            khSign = list[i];
                            $scope.khSign = {src: list[i].SRC, signDate: bz.date};
                            khDate = $filter('date')(bz.date,'yyyy-MM-dd HH:mm:ss');
                            break;
                        case 'CEMDLZZ':
                            cemSign = list[i];
                            $scope.cemSign = {src: list[i].SRC, signDate: bz.date};
                            cemDate = $filter('date')(bz.date,'yyyy-MM-dd HH:mm:ss');
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
        $scope.saveKhHandSign = function ($image, $date) {
            if (!$image.src) {
                TaskService.deleteFile(khSign);  //判断是否删除 删除本地数据；并把全局变量置空
                khSign = null;
                return;
            }
            if (khSign) {
                khSign.SRC = $image.src;
                khSign.ISUPLOAD = '0';
                khSign.BZ = JSON.stringify({date: new Date().getTime(),bs: 'KHDLZZ'});
                persistence.flush();
            } else {
                var time = new Date().getTime();
                var key = "SignCA" +time+".png";
                TaskService.saveFileLocal($image.src, {
                    GZDBH: $scope.jbxx.wkordrno,  //工作单编号
                    RWH: '',  //任务号
                    HJH: '', //环节号
                    YWLX: 'workOrder',  //类型
                    YWCLR: $appConfig.userInfo.RYBS,
                    BZ: JSON.stringify({date: new Date().getTime(),bs: 'KHDLZZ'}),  //备注
                    ENABLED: '1',
                    ISSTREAM: '1',
                    KEY:key,
                    ONLYBS: $scope.signOnlybs
                }).then(function (file) {
                    khSign = file;
                });
            }
            khDate = $filter('date')($date,'yyyy-MM-dd HH:mm:ss');
        };
        /**
         * 代澳电電子簽名方法
         * @param $image
         * @param $date
         */
        $scope.saveCemHandSign = function ($image, $date) {
            if (!$image.src) {
                TaskService.deleteFile(cemSign);  //判断是否删除 删除本地数据；并把全局变量置空
                cemSign = null;
                return;
            }
            if (cemSign) {
                cemSign.SRC = $image.src;
                cemSign.ISUPLOAD = '0';
                cemSign.BZ = JSON.stringify({date: new Date().getTime(),bs: 'CEMDLZZ'});
                persistence.flush();
            } else {
                var time = new Date().getTime();
                var key = "SignCEM" +time+".png";
                TaskService.saveFileLocal($image.src, {
                    GZDBH: $scope.jbxx.wkordrno,  //工作单编号
                    RWH: '',  //任务号
                    HJH: '', //环节号
                    YWLX: 'workOrder',  //类型
                    YWCLR: $appConfig.userInfo.RYBS,
                    BZ: JSON.stringify({date: new Date().getTime(),bs: 'CEMDLZZ'}),  //备注
                    ENABLED: '1',
                    ISSTREAM: '1',
                    KEY:key,
                    ONLYBS: $scope.signOnlybs
                }).then(function (file) {
                    cemSign = file;
                });
            }
            cemDate = $filter('date')($date,'yyyy-MM-dd HH:mm:ss');
        };
        /**
         * 跳转发送邮件界面
         */
        $scope.toEmail = function () {
            if (!$scope.emailFlag) {
                hyMui.alert('請保存電力裝置技術要求單');
                return
            }
            mainNavi.pushPage('pages/cemydzy/dljs/cem_fsyj.html', {
                fileId:pdffileId,
                workOrderNo:$scope.jbxx.wkordrno,
                cancelIfRunning: true
            })
        }
        /**
         * 跳转二維碼界面
         */
        $scope.toEwm = function () {
            if (!$scope.emailFlag) {
                hyMui.alert('請保存電力裝置技術要求單');
                return
            }
            mainNavi.pushPage('pages/cemydzy/dljs/cemydzy_scewm.html', {
                fileId:pdffileId,
                workOrderNo:$scope.jbxx.wkordrno,
                cancelIfRunning: true
            })
        }
    }]);