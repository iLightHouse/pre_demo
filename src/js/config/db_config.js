/**
 * Created by ym on 2017/8/25.
 */
/**
 * 创建用于云南营销移动应用APP内部使用的WebSql数据库
 */
hyMui.createDB('com.haiyisoft.nwydyx', '', 40 * 1024 * 1024);

persistence.debug = false;

/**
 * 所有待办数据表
 */
var ggmk_db = persistence.define('nw_ggmk_db', {
    gzdbh: 'TEXT', //工作单编号
    slh: 'TEXT',
    rwh: 'TEXT',//任务号
    hjh: 'TEXT',//环节号
    bzhjh: 'TEXT',//标准环节号
    hjmc: 'TEXT',
    zyms: 'TEXT',
    dbly: 'TEXT',
    crrmc: 'TEXT',
    chsj: 'TEXT',
    jhclsj: 'TEXT',
    jhclzzsj: 'TEXT',
    sjclsj: 'TEXT',
    dburl: 'TEXT',
    ywzl: 'TEXT',//业务子类
    clzt: 'TEXT',
    cldw: 'TEXT',
    clgw: 'TEXT',
    clr: 'TEXT',
    ywzldm: 'TEXT'
});

/**
 * 系统下拉编码对应表
 * @type {*}
 */
var DB_SYS_DROP_CODE = persistence.define('SYS_DROP_CODE', {
    UNIQUEIDEN: 'TEXT',  //主键标识
    DMBMBS: 'TEXT',  //代码编码标识
    DMFLBS: 'TEXT',  //代码分类标识
    SJDMBMBS: 'TEXT',  //上级代码编码标识
    DMFL: 'TEXT',  //代码分类
    DMBMNM: 'TEXT',  //代码编码内码
    DMBM: 'TEXT',  //代码编码
    DMBMMC: 'TEXT',  //代码编码名称
    XSSX: 'TEXT',  //显示顺序
    KXBZ: 'TEXT',  //可选标志
    SJLY: 'TEXT',  //数据来源 static：静态 dynamic：动态
    YYCJ1: 'TEXT',  //应用场景1
    YYCJ2: 'TEXT',  //应用场景2
    YYCJ3: 'TEXT',  //应用场景3
    YYCJ4: 'TEXT',  //应用场景4
    YYCJ5: 'TEXT',  //应用场景5
    DZGX1: 'TEXT',  //对照关系1
    DZGX2: 'TEXT',  //对照关系2
    DZGX3: 'TEXT'  //对照关系3
});

/**
 * 中间检查-基本信息
 * @type {*}
 */
var ZJJC_JBXX = persistence.define('NW_ZJJC_JBXX', {
    DYDJDM: 'INTEGER',  //电压等级代码
    GDDWDM: 'TEXT',  //供电单位代码
    GZDBH: 'TEXT',  //工作单编号
    HTRL: 'TEXT',  //合同容量
    JBR: 'TEXT',  //经办人
    JBRDH: 'TEXT',  //经办人电话
    YDDZ: 'TEXT',  //用电地址
    YDLBDM: 'TEXT',  //用电类别代码
    YHBH: 'TEXT',  //用户编号
    YHMC: 'TEXT',  //用户名称
    YRL: 'TEXT',  //原容量
    YWLBBH: 'TEXT',  //业务类别编号
    YWZLBH: 'TEXT',  //业务子类编号
    ZJRL: 'TEXT',  //增减容量
    ZSSLRQ: 'TEXT',  //正式受理日期
    GCDWHYXXList: 'JSON',  //工程单位核验信息
    KHGCList: 'JSON',  //客户工程
    KHGCJCJLList: 'JSON',  //客户工程检查记录
    RWH: 'TEXT',  //任务号
    rybs: 'TEXT',   //人员标识
    JLYSJL: 'TEXT',  //计量验收结论
    JLYSGD: 'TEXT'  //计量验收工单
});

/**
 * 工作单的图片附件数据
 * @type {*}
 */
var PHOTO_FILE_INFO = persistence.define('NW_PHOTO_FILE_INFO', {
    GZDBH: 'TEXT',  //工作单编号
    RWH: 'TEXT',  //任务号
    HJH: 'TEXT',  //环节号
    SRC: 'TEXT',  //图片文件路径
    FJFZBS: 'TEXT',  //图片文件路径
    YWLX: 'TEXT',  //类型
    YWCLR: 'TEXT',  //上传人登录账号
    BZ: 'TEXT',  //备注
    MBH: 'TEXT',  //模板号
    MBBBH: 'TEXT',  //模板版本号
    YHBH: 'TEXT',  //用户编号
    ENABLED: 'TEXT',  //删除标志 0:删除 1:未删除
    ISUPLOAD: 'TEXT',  //上传标志 0:未上传 1:已上传
    ISSTREAM: 'TEXT',  //是否是流 0:否 1:是（电子签名SRC是流）
    ONLYBS: 'TEXT',  //唯一标示缓存用
    KEY: 'TEXT'   //电子签名上传标识
});

/**
 * 文件下载数据
 * @type {*}
 */
var DOWNLOAD_FILE_INFO = persistence.define('NW_DOWNLOAD_FILE_INFO', {
    fileName: 'TEXT',  //文件名称
    createTime: 'INT', //下载开始时间
    time: 'INT',  //下载时间
    url: 'TEXT',  //本地路径
    rybs: 'TEXT',   //人员标识
    fjbs: 'TEXT',   //附件标识
    percent: 'INT', //下载进度
    serviceName: 'TEXT',
    total: 'INT',
    loaded: 'INT',
    options: 'JSON',
    enabled: 'TEXT' //1:下载成功，0：失败
});

/**
 * 消息图片
 * @type {*}
 */
var CEM_PHOTO_FILE_INFO = persistence.define('CEM_PHOTO_FILE_INFO', {
    FILEID: 'TEXT',  // 附件标识
    BASE: 'TEXT',  // base64编码
    YHBH: 'TEXT' // 本地时间
});

/**
 * 移动作业-传递工单信息
 * @type {*}
 */
var CEM_PASS_ORDER_LIST = persistence.define('CEM_PASS_ORDER_LIST', {
    gzdbh: 'TEXT',  // 工作单编号
    orderInfo: 'TEXT',  // 工单详情信息
    hjh: 'TEXT',  // 标准环节号
    localTime: 'TEXT'  // 本地时间
});

/**
 * 移动作业-离线工单信息
 * @type {*}
 */
var CEM_OFFLINE_ORDER_LIST = persistence.define('CEM_OFFLINE_ORDER_LIST', {
    gzdbh: 'TEXT',  // 工作单编号
    orderInfo: 'TEXT',  // 工单详情信息
    hjh: 'TEXT',  // 标准环节号
    wkflwtachno: 'TEXT',  // 环节号
    localTime: 'TEXT'  // 本地时间
});

/**
 * 移动作业-离线工单入参信息
 * @type {*}
 */
var CEM_OFFLINE_PARAM_LIST = persistence.define('CEM_OFFLINE_PARAM_LIST', {
    gzdbh: 'TEXT',  // 工作单编号
    orderInfo: 'TEXT',  // 工单详情信息
    hjh: 'TEXT',  // 标准环节号
    wkflwtachno: 'TEXT',  // 环节号
    localTime: 'TEXT'  // 本地时间
});

persistence.schemaSync();
persistence.flush();
