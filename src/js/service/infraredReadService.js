/**
 * Created by liukeyu on 2017/12/15.
 * 红外抄表服务
 */
app.factory('InfraredReadService', ['$q', function ($q) {
    /**
     * 示数对应
     * @type {{}}
     */
    var INFRARED_TYPE_07 = {
        '121': '0001FF00',//正有功总 TF07、T0 包含T0 T1 T2 T3 T4
        '122': '00010100',//正有功尖峰
        '123': '00010200',//正有功峰
        '124': '00010300',//正有功平
        '125': '00010400',//正有功谷
        '131': '00030000',//正无功总
        '221': '0002FF00',//反有功总 RF07、R0 包含R0 R1 R2 R3 R4
        '222': '00020200',//反有功峰
        '223': '00020300',//反有功平
        '224': '00020400',//反有功谷
        '231': '00040000', //反无功总
        '121-R': '05060101',//上次日冻结正向有功
        '131-R': '05060301',//上次日冻结正无功总
        '221-R': '05060201',//上次日冻结反有功总
        '231-R': '05060401' //上次日冻结反无功总
    };

    var INFRARED_TYPE_97 = {
        '121': '901F',//正有功总 901F、9010 包含T0 T1 T2 T3 T4
        '122': '9011',//正有功尖峰
        '123': '9012',//正有功峰
        '124': '9013',//正有功平
        '125': '9014',//正有功谷
        '131': '9110',//正无功总
        '221': '902F',//反有功总 902F、9020 包含R0 R1 R2 R3 R4
        '222': '9022',//反有功峰
        '223': '9023',//反有功平
        '224': '9024',//反有功谷
        '231': '9120' //反无功总
    };


    var INFRARED_TYPE_FX = {
        '正向有功-总': '121',//正有功总
        '正向有功-尖': '122',//正有功尖峰
        '正向有功-峰': '123',//正有功峰
        '正向有功-平': '124',//正有功平
        '正向有功-谷': '125',//正有功谷
        '组合无功1-总': '131',//正无功总
        '正向无功-总': '131',
        '反向有功-总': '221',//反有功总
        '反向有功-峰': '222',//反有功峰
        '反向有功-平': '223',//反有功平
        '反向有功-谷': '224',//反有功谷
        '组合无功2-总': '231', //反无功总
        '反向无功-总': '231',

        '上1次日冻结正向有功电能-总': '121',//日冻结 正有功总
        '上1次日冻结正向有功电能-尖': '122',//日冻结正有功尖峰
        '上1次日冻结正向有功电能-峰': '123',//日冻结正有功峰
        '上1次日冻结正向有功电能-平': '124',//日冻结正有功平
        '上1次日冻结正向有功电能-谷': '125',//日冻结正有功谷
        '上1次日冻结组合无功1电能数据': '131',//日冻结正无功总
        '上1次日冻结反向有功电能-总': '221',//日冻结反有功总
        '上1次日冻结反向有功电能-峰': '222',//日冻结反有功峰
        '上1次日冻结反向有功电能-平': '223',//日冻结反有功平
        '上1次日冻结反向有功电能-谷': '224',//日冻结反有功谷
        '组合无功2电能数据': '231' //日冻结反无功总
    };
    var INFRARED_FFIDS = [
        {code:'01',name:'DL/T 645-2007协议',infraredTypes:INFRARED_TYPE_07},
        {code:'02',name:'DL/T 645-1997协议',infraredTypes:INFRARED_TYPE_97}
    ];
    var infraredReadService = {
        readTime: 10 * 1000,//10s
        infraredFfids:INFRARED_FFIDS,
        defaultFfid:'01',
        /**
         * 读取信息
         * @param options{
                    requestType: '',
                    dnb_id: '000001518587', //电能表资产编号 12位
                    dnb_number_type: 'TF07' //读取示数类型
                }
         * @returns {*}
         * @private
         */
        _read: function (options) {
            var deferred = $q.defer();
            if (!window.HYInfraredReading) {
                deferred.reject({code: -1001, message: '初始化失败，插件不存在！'});
                return deferred.promise;
            }
            var self = this;
            var readFailNum = 0;
            var callback = function(){
                readFailNum++;
                var play = readFailNum<3?0:1;
                options.play = play;
                self.infraredRead(options).then(function(res){
                    // alert('抄回表示数:'+JSON.stringify(res));
                    var content = self._analyticReadData(res);
                    deferred.resolve(content);
                },function(err){
                    if(readFailNum<3){
                        callback.call(this);
                    }else {
                        deferred.reject(err);
                    }
                });
            };
            callback.call(this);

            return deferred.promise;
        },
        /**
         * 抄表
         * @param options
         * @returns {Promise}
         */
        infraredRead:function (options) {
            var deferred = $q.defer();
            var self = this;
            HYInfraredReading.read(function (res) {
                deferred.resolve(res);
            }, function (err) {
                deferred.reject(err);
            }, options);
            return deferred.promise;
        },
        /**
         * 读取信息
         * @param options{
                    requestType: '',
                    dnb_id: '000001518587', //电能表资产编号 12位
                    dnb_number_type: 'TF07' //读取示数类型
                }
         * @returns {*}
         * @private
         */
        read: function (options) {
            var deferred = $q.defer();
            options = this._getReadOptions(options);
            if (!options.dnb_number_type) {
                deferred.reject({code: -1007, message: '示数类型错误'});
                return deferred.promise;
            }
            var self = this;
            self._read(options).then(function (data) {
                //self._close();
                deferred.resolve({code: 1001, content: data});
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        },
        /**
         * 获取红外参数
         * @param options
         * @private
         */
        _getReadOptions: function (options) {
            options = options || {};
            var diff = options.diff || '01';
            options.requestType = 'infrared';//表类型
            options.dnb_id = this._getAssetNo(options.dnb_id);
            options.dnb_number_type = this._getReadType(options.dnb_number_type,diff);

            return options;
        },
        /**
         * 获取红外识别的资产编号 12位数字不够补0
         * @param assetNo
         * @private
         */
        _getAssetNo: function (assetNo) {
            assetNo = assetNo || '';
            assetNo = assetNo.replace(/[^\d.]/g, '');
            assetNo = '000000000000' + assetNo;
            assetNo = assetNo.substr(assetNo.length - 12);
            return assetNo;
        },

        /**
         * 获取红外识别的示数类型
         * @param type
         * 111    最大需量
         * 121    正有功总
         * 122    正有功尖峰
         * 123    正有功峰
         * 124    正有功平
         * 125    正有功谷
         * 131    正无功总
         * 221    反有功总
         * 222    反有功峰
         * 223    反有功平
         * 224    反有功谷
         * 231    反无功总
         * @param diff 01:2007协议 02:1997协议
         * @private
         */
        _getReadType: function (type,diff) {
            type = type || '121';
            var infraredTypeList = this._getInfraredTypeByCode(diff);
            return infraredTypeList[type];
        },
        /**
         * 根据code获取type列表
         * @param diff
         * @private
         */
        _getInfraredTypeByCode:function(diff){
            diff = diff || '01';
            var infraredObj = INFRARED_FFIDS[0];
            var list = INFRARED_FFIDS.filter(function(item){
                return item.code == diff;
            });
            if(list && list.length>0){
                infraredObj = list[0];
            }

            return infraredObj.infraredTypes;
        },
        /**
         * 解析数据
         * @param res[{
         * code:'100',
         * type:'正向有功-总',
         * unit:'kWh'
         * }]
         * @private
         */
        _analyticReadData: function (res) {
            if (!res || res.length <= 0) return null;
            var content = null;
            var error = null;
            for (var i = 0; i < res.length; i++) {
                var val = res[i];
                if (!val) continue;
                var key = val.type;
                var v = val.code;
                if (!key || key.trim().length <= 0) continue;
                if (!v || v.trim().length <= 0) continue;

                var k = INFRARED_TYPE_FX[key];
                if (k) {
                    content = content || {};
                    content[key] = v;
                    content[k] = v;
                }
            }
            return content;
        }

    };
    return infraredReadService;
}]);