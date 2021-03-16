app.factory('NativeService', ['$q', function ($q) {
    var nativeService = {
        IDkeys: ['Name', 'Sex', 'Folk', 'Birt', 'Addr', 'Num', 'Issue', 'Valid', 'Type', 'Cover'],
        /**
         * 扫一扫
         */
        scan: function () {
            var deferred = $q.defer();
            if (window.DecodeUtil) {
                var dataJson = {
                    'type': '0',
                    'photo': '1'
                };
                DecodeUtil.scan(dataJson, function (jsonData) {
                    if (jsonData.errCode === '0') {
                        deferred.resolve(jsonData.result || '');
                    } else {
                        deferred.reject();
                    }
                });
            } else if (window.HYBarcodeScanner) {
                HYBarcodeScanner.scan(function (res) {
                    if (!res.cancel && res.buttonIndex == '-1') {
                        var code = res.codes[0].value || '';
                        var encode = encodeURI(code);
                        while (encode.indexOf('%00') > -1) {
                            encode = encode.replace('%00', '');
                        }
                        deferred.resolve(decodeURI(encode));
                    }
                }, function () {
                    hyMui.toast({
                        message: "掃碼出現異常"
                    });
                    deferred.reject();
                });
            } else {
                hyMui.toast({
                    message: "沒有找到掃碼的API對象"
                });
                deferred.reject();
            }
            return deferred.promise;
        },
        /**
         * 云脉身份证识别
         * @returns {*}
         * @constructor
         */
        IDcardScan: function () {
            var deferred = $q.defer();
            if (window.HYYMScan) {
                HYYMScan.scan(function (res) {
                    deferred.resolve(nativeService._dealIDcardRes(res));
                }, function (error) {
                    var msg = error.message || '身份证识别异常';
                    hyMui.toast({
                        message: msg
                    });
                    deferred.reject();
                }, 0);
            } else {
                hyMui.toast({
                    message: '没有找到识别插件'
                });
                deferred.reject();
            }
            return deferred.promise;
        },
        /**
         * 身份证识别参数处理
         * @param result
         * @returns {{}}
         * @private
         */
        _dealIDcardRes: function (result) {
            if (!result) {
                return {};
            }
            var res = {};
            for (var i = 0; i < this.IDkeys.length; i++) {
                var IDkey = this.IDkeys[i];
                res[IDkey] = result[IDkey] ? result[IDkey].value : '';
            }
            return res;
        },
        /**
         * 银行卡识别
         * @returns {*}
         */
        bankCardScan: function () {
            var deferred = $q.defer();
            if (window.HYYMScan) {
                HYYMScan.scan(function (res) {
                    deferred.resolve(res || {});
                }, function (error) {
                    var msg = error.message || '银行卡识别异常';
                    hyMui.toast({
                        message: msg
                    });
                    deferred.reject();
                }, 1);
            } else {
                hyMui.toast({
                    message: '没有找到识别插件'
                });
                deferred.reject();
            }
            return deferred.promise;
        }
    };
    return nativeService;
}]);