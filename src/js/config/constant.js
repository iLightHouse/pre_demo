angular.module('nwConifgModule', [])
    .factory('TFConstant', HyConstantFactory);

/**
 * HYConstant 常量服务.
 * @ngInject
 */
function HyConstantFactory() {
    var COMMON_TASKLIST_URL = 'pages/common/dblb/dblb.html';
    var COMMON_TASKDETIL_URL = 'pages/common/dblb/dbDetial.html';
    var JCDZ = "http://172.20.33.114:8080/ccs/";
    var RSDZ = "http://172.20.33.114:8060/rightService/";//权限系统地址
    // var JCDZ = "http://tccsapp.cem-macau.com/ccs/";
    return {
        // KF_CS_URL: JCDZ+"CS/service/",
        // KF_RP_URL: JCDZ+"RP/service/",
        // KF_MR_URL: JCDZ+"MR/service/",
        // KF_ME_URL: JCDZ+"ME/service/",
        // KF_WO_URL: JCDZ+"WO/service/",
        // KF_DR_URL: JCDZ+"DR/service/",
        // KF_QC_URL: JCDZ+"QC/service/",
        // KF_EP_URL: RSDZ+"ep/right/",
        // KF_FRAME_URL: JCDZ+"sys/service/",
        KF_CS_URL: "http://172.20.32.153:8882/CsService/CS/service/",
        KF_RP_URL: "http://172.20.32.153:8884/RpService/RP/service/",
        KF_MR_URL: "http://172.20.32.153:8885/MrService/MR/service/",
        KF_ME_URL: "http://172.20.32.153:8886/MeService/ME/service/",
        KF_WO_URL: "http://172.20.32.153:8883/WoService/WO/service/",
        KF_DR_URL: "http://172.20.32.153:8888/DrService/DR/service/",
        KF_QC_URL: "http://172.20.32.153:8889/QueryCenter/QC/service/",
        KF_EP_URL: "http://172.20.32.153:8060/rightService/ep/right/",
        KF_FRAME_URL: "http://172.20.32.153:8899/CcsFrame/sys/service/",
        SERVICE_MAP: {
            queryUserLoginInfo: 'QueryUserLoginInfoServiceRest',
            appQueryXtDmbmInfo: 'QueryXtDmbmInfoServiceRest',
            queryXtZzInfo: 'QueryXtZzInfoServiceRest',
            appQueryTaskList: 'QueryTaskListServiceRest',
            'queryPotentialRiskEntity/queryPotentialRiskEntity': 'QueryPotentialRiskEntityServiceRest',
            savePotentialRiskEntity: 'SavePotentialRiskEntityServiceRest',
            queryPotentialRiskRecheckEntity: 'QueryPotentialRiskRecheckEntityServiceRest',
            appQueryHouseInfoService: 'QueryHouseInfoServiceRest',
            appQueryAddressInfoRestController: 'QueryAddressInfoServiceRest',
            pQueryElectInfo: 'QueryElectInfoServiceRest',
            queryMeterInfo: 'QueryMeterInfoServiceRest',
            'sysAttach/retrieve': 'QueryFileInfoServiceRest',
            queryPowerRecoverEntity: 'QueryPowerRecoverEntityServiceRest',
            savePowerRecoverEntity: 'SavePowerRecoverEntityServiceRest',
            queryJointInspectionEntity: 'QueryFailureHandlingEntityServiceRest',
            'appSaveFailureHandlingEntityService/save': 'SaveFailureHandlingEntityServiceRest',
            queryJointInspectionEntitys: 'QueryJointInspectionEntityServiceRest',
            saveJointInspectionEntity: 'SaveJointInspectionEntityServiceRest',
            queryTemporaryElectEntity: 'QueryTemporaryElectEntityServiceRest',
            QueryDMIRSealRecordInfoDSServiceRestController: 'QueryDMIRSealRecordInfoDSServiceRest',
            queryTemporaryChecksEntity: 'QueryTemporaryChecksEntityServiceRest',
            saveTemporaryChecksEntity: 'SaveTemporaryChecksEntityServiceRest',
            pQueryChaiLockInfo: 'QueryChaiLockInfoServiceRest',
            pQueryPowerOutagesEntity: 'QueryPowerOutagesEntityServiceRest',
            savePowerOutagesEntity: 'SavePowerOutagesEntityServiceRest',
            confirmCancellingDisconnection: 'ConfirmCancellingDisconnectionServiceRest',
            'querySceneCheckEntity/querySceneCheckEntity': 'QuerySceneCheckEntityServiceRest',
            appSaveSceneCheckEntity: 'SaveSceneCheckEntityServiceRest',
            saveCSAppDlzzjsyqd: 'SaveCSAppDlzzjsyqdServiceRest',
            saveDMAppYbfbd: 'SaveDMAppYbfbdServiceRest',
            'emailSending/sendEmail': 'SendEmailServiceRest',
            queryDismountingAssignEntity: 'QueryDismountingAssignEntityServiceRest',
            saveDismountingAssignEntity: 'SaveDismountingAssignEntityServiceRest',
            queryAssemblyInfo: 'QueryAssemblyInfoServiceRest',
            AppsaveAssemblyInfo: 'SaveAssemblyInfoServiceRest',
            'querydmregisterreadinginstallationandremovalinfo/query': 'QuerydmregisterreadinginstallationandremovalinfoRest',
            'queryequipmentmasterdata/querydmequipmenttypeandtechnicalparameterinfods': 'QueryEquipmentParameterServiceRest',
            'queryequipmentmasterdata/searchequipmasterdata': 'QueryEquipmentMasterServiceRest',
            queryContractAccount: 'QueryContractAccountServiceRest',
            queryPropertyNumber: 'QueryPropertyNumberServiceRest',
            appQueryBasicOrder: 'QueryBasicOrderInfoServiceRest',
            'createAssembleDismantleOrder/createAssembleDismantleOrder': 'CreateAssembleDismantleOrderServiceRest',
            queryAssemblyEquipmentList: 'QueryAssemblyEquipmentListServiceRest',
            saveAssemblyEquipmentList: 'SaveAssemblyEquipmentListServiceRest',
            'queryDnbBjzcsbjl/query': 'QueryDnbBjzcsbjlRest',
            'queryHgqBjzcsbjl/query': 'QueryHgqBjzcsbjlRest',
            'sysAttach/download': 'DownloadFileServiceRest',
            commitWorkOrderTaskService: 'CommitWorkOrderTaskServiceRest',
            queryXtRyInfo: 'QueryXtRyInfoServiceRest',
            queryXtYwlbInfo: 'QueryXtYwlbInfoServiceRest',
            'sysAttach/uploadBase64Muti': 'UploadBase64MutiServiceRest',
            chgPassword: 'ChgPasswordRest',
            register: 'CreateEwmService',//移動管理後台的一個服務--生成二維碼隨機碼
            appQueryRemoveEquipList: 'QueryRemoveEquipListServiceRest',
            saveDownloadTimeOfDisconAndRcnnTask: 'SaveDownloadTimeOfDisconAndRcnnTaskServiceRest',
            estimatedReadingValue: 'EstimatedReadingValueServiceRest',
            'queryAzwz/query': 'QueryAzwzRest',
            appQueryHoldEquipList: 'QueryHoldEquipListServiceRest',
            dispatchWorkOrderTaskService: 'DispatchWorkOrderTaskServiceRest',
            TransformSupplyPointCoordinate: 'TransformSupplyPointCoordinateServiceRest',
            saveHandholdMovingTrajectory: 'SaveHandholdMovingTrajectoryServiceRest',
            appQueryPackEquipList: 'QueryPackEquipListServiceRest',
            'saveDMWarehouseTransferEquipmentInfo/saveDMWarehouseTransferEquipmentInfo': 'SaveDMWarehouseTransferEquipmentInfoServiceRest'
        },
        LOCAL_NOT_SAVE: '',// 未办理工单
        LOCAL_SAVE: '',// 已保存工单
        LOCAL_PASS: '',// 已传递工单
        LOCAL_REMINDER_TIME: '',// 预约提醒时间
        LOCAL_ORDERAPI_TIME: '',// 自动接收任务时间
        LOCAL_MJ_NEWS: '',// M+消息
        LOCAL_HOME_MENUS: '',// 菜单
        LOCAL_CLEAR_TIME: '',// 清除缓存时间
        LOCAL_PROMPT_TIME: '',// 复电剩余时间提醒
        LOCAL_PHOTO_ARY: '',// 本地照片photoKey
        GROUP_LIST: [],
        LOCAL_REMINDER_WORKER: '',// 预约提醒工单数组
        /**
         * 系统首页菜单数组
         */
        MENU_LIST: [],
        /**
         * 现场勘查业务列表
         */
        XCKC_LIST: [],
        // 清除库表配置
        tableNameList: [
            DB_SYS_DROP_CODE
            /*CBQD_USER_INFO,
            YDCB_METER_INFO,
            CBFH_USER_INFO,
            CBFH_METER_INFO,
            CBBC_USER_INFO,
            CBBC_METER_INFO*/
        ]
    };
}

