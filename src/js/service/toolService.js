/**
 * Created by 刘克玉 on 2017/09/13.
 * 工具服务，共同方法
 */

app.factory('ToolService', ['$hyHttp', '$q', '$filter', '$hyUtil', 'TFConstant',
    function ($hyHttp, $q, $filter, $hyUtil, TFConstant) {

        var service = {};
        /**
         * 判断对象是否为空
         * @param obj
         * @returns {boolean}
         */
        service.isEmpty = function (obj) {
            if (obj == null)
                return true;
            if (angular.isArray(obj) || angular.isString(obj))
                return obj.length === 0;
            for (var key in obj)
                if (obj.hasOwnProperty(key))
                    return false;
            return true;
        };
        /**
         * 组合级联下拉数据
         * @param list 级联数组[一级数组，二级数组，....]
         * @param keyKey 键值
         * @param valKey 显示字段键值
         * @param parentKey 父级ID对应键值（与keyKey对应）
         * @param defaultVal 每级的默认值
         * @returns {Array}
         */
        service.createDropListData = function (list, keyKey, valKey, parentKey, defaultVal) {

            function filterTyData(input, key, index) {
                if (!input || input.length <= 0) return null;
                var data = [];
                if (defaultVal && defaultVal.length > index && defaultVal[index])
                    data.push({value: defaultVal[index].value, text: defaultVal[index].text});

                for (var i = 0; i < input.length; i++) {
                    var item = input[i];
                    if (item[parentKey] == key) {
                        data.push({value: item[keyKey], text: item[valKey]});
                    }
                }
                return data;
            }

            function getNextXjObject(parent, childs, index) {
                if (!parent || !childs) return {};
                var obj = {};
                for (var i = 0; i < parent.length; i++) {
                    var data = parent[i];
                    var key = data[keyKey];
                    obj[key] = filterTyData(childs, key, index);
                }
                return obj;
            }

            if (!list || list.length <= 0) return [];
            var res = [];
            var len = list.length;
            var yjList = list[0];
            if (!yjList || yjList.length <= 0) return res;
            var yjLen = yjList.length;
            var yjDrop = [];
            if (defaultVal && defaultVal.length > 0 && defaultVal[0]) {
                //yjDrop.push({value:'-----',text:'请选择'});
                yjDrop.push({value: defaultVal[0].value, text: defaultVal[0].text});
            }

            for (var i = 0; i < yjLen; i++) {
                var item = yjList[i];
                yjDrop.push({value: item[keyKey], text: item[valKey]});
            }
            res.push(yjDrop);
            for (var j = 1; j < len; j++) {
                var parent = list[j - 1];
                var childs = list[j];
                res.push(getNextXjObject(parent, childs, j));
            }

            return res;
        };

        /**
         * 验证邮编格式
         * @param YbNumber  邮政编码
         * @returns {boolean}
         */
        service.isYzbm = function (YbNumber) {
            if (!YbNumber) {
                return false;
            }
            var pattern = /^[0-9]{6}$/;
            return pattern.test(YbNumber);
        };

        /**
         * 拨打电话
         * @param phoneNum
         * @param type
         * @param callback
         */
        service.phoneCall = function (phoneNum, type, callback) {
            if (!phoneNum) {
                hyMui.alert("该用户无手机号码可拨打");
                return;
            }
            ons.notification.confirm({
                message: phoneNum,
                title: '提示',
                fontClass: 'tel-font-large',
                buttonLabels: ['取消', '呼叫'],
                cancelable: true,
                callback: function (index) {
                    if (index == 1) {
                        if (window.HYPhone) {
                            type = type || 1;
                            HYPhone.callPhone(phoneNum, type);
                        } else {
                            window.location.href = 'tel:' + phoneNum;
                        }
                        if (callback && angular.isFunction(callback)) {
                            callback.call(this);
                        }
                    }
                }
            });
        };

        /**
         * 调用存储接口(简版)
         * @param param
         * @returns {*}
         */
        service.dealProce = function (param) {
            var deferred = $q.defer();
            $hyHttp.appPost('webServiceNew', {
                'serverName': REQ_WEB_SER_CCGCCL,
                request1: JSON.stringify(param)
            }).then(function (data) {
                deferred.resolve(data);
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };

        /**
         * 金额格式化 格式化 万，亿后缀
         * @param money
         * @param type 1:万最多显示千万，2：万最多显示百万
         * @returns {string}
         */
        service.moneyFormat = function (money, type) {
            if (typeof money != 'string') {//判断是否字符串类型
                money = money + "";
            }
            var formatMoney = money;
            if (!type) {
                type = 1;
            }
            if (type == 1) {
                if (money.indexOf('.') && money.indexOf('.') > 4 && money.indexOf('.') <= 8) {
                    money = money.substring(0, money.indexOf('.') - 4) + '.'
                        + money.substring(money.indexOf('.') - 4, money.indexOf('.'));
                    formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '万';
                }
                if (money.indexOf('.') == '-1' && money.length > 4 && money.length <= 8) {
                    money = money.substring(0, money.length - 4) + '.'
                        + money.substring(money.length - 4, money.length);
                    formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '万';
                }
            } else if (type == 2) {
                if (money.indexOf('.') && money.indexOf('.') > 4 && money.indexOf('.') < 8) {
                    money = money.substring(0, money.indexOf('.') - 4) + '.'
                        + money.substring(money.indexOf('.') - 4, money.indexOf('.'));
                    formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '万';
                }
                if (money.indexOf('.') == '-1' && money.length > 4 && money.length < 8) {
                    money = money.substring(0, money.length - 4) + '.'
                        + money.substring(money.length - 4, money.length);
                    formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '万';
                }
            }

            var max = type == 1 ? 9 : 8;
            if (money.indexOf('.') && money.indexOf('.') >= max) {
                money = money.substring(0, money.indexOf('.') - 8) + '.'
                    + money.substring(money.indexOf('.') - 8, money.indexOf('.') - 4);
                formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '亿';
            }
            if (money.indexOf('.') == '-1' && money.length >= max) {
                money = money.substring(0, money.length - 8) + '.'
                    + money.substring(money.length - 8, money.length - 4);
                formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '亿';
            }
            return formatMoney;
        };

        /**
         * 金额格式化 格式化 万
         * @param money
         * @returns {string}
         */
        service.moneyFormat2 = function (money) {
            if (typeof money != 'string') {//判断是否字符串类型
                money = money + "";
            }
            var formatMoney = money;
            if (money.indexOf('.') && money.indexOf('.') > 4) {
                money = money.substring(0, money.indexOf('.') - 4) + '.'
                    + money.substring(money.indexOf('.') - 4, money.indexOf('.'));
                formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '万';
            }
            if (money.indexOf('.') == '-1' && money.length > 4) {
                money = money.substring(0, money.length - 4) + '.'
                    + money.substring(money.length - 4, money.length);
                formatMoney = ($filter('number')(parseFloat(money), 2)).toString() + '万';
            }

            return formatMoney;
        };

        /**
         * 获取整理后的客服业务子类树
         * @param orgsList
         * @param parentCode
         * @param list
         * @returns {*}
         */
        service.getYwzlDropList = function (orgsList, parentCode, list) {
            list = list || [];
            if (!orgsList || !angular.isArray(orgsList)) return list;

            for (var i = 0; i < orgsList.length; i++) {
                var id = orgsList[i].objectId;
                var item = {
                    code: id,
                    label: orgsList[i].objectName,
                    parentCode: parentCode,
                    sjdmbmbs: orgsList[i].parentId
                    // notSelect:true
                };
                list.push(item);
                if (orgsList[i].KfywzlTreeOutType) {
                    // 如果子节点是对象，转为数组
                    if (!angular.isArray(orgsList[i].KfywzlTreeOutType)) {
                        orgsList[i].KfywzlTreeOutType = $hyUtil.convertToArray(orgsList[i].KfywzlTreeOutType);
                    }
                    service.getYwzlDropList(orgsList[i].KfywzlTreeOutType, id, list);
                }
            }
            return list;
        };

        service.getYwbqDropList = function (orgsList, parentCode, list) {
            list = list || [];
            if (!orgsList || !angular.isArray(orgsList)) return list;

            for (var i = 0; i < orgsList.length; i++) {
                var id = orgsList[i].objectId;
                var item = {
                    code: id,
                    label: orgsList[i].objectName,
                    parentCode: parentCode,
                    sjdmbmbs: orgsList[i].parentId
                    // notSelect:true
                };
                list.push(item);
                if (orgsList[i].KfywbqTreeOutType) {
                    // 如果子节点是对象，转为数组
                    if (!angular.isArray(orgsList[i].KfywbqTreeOutType)) {
                        orgsList[i].KfywbqTreeOutType = $hyUtil.convertToArray(orgsList[i].KfywbqTreeOutType);
                    }
                    service.getYwbqDropList(orgsList[i].KfywbqTreeOutType, id, list);
                }
            }
            return list;
        };
        /**
         * 将16进制颜色码转成RGB或者RGBA
         * @param hex 16进制颜色码
         * @param a 透明度
         * @returns {string}
         */
        service.hex2Rgb = function (hex, a) { //十六进制转为RGB
            var rgb = []; // 定义rgb数组
            if (/^\#[0-9A-F]{3}$/i.test(hex)) { //判断传入是否为#三位十六进制数
                var sixHex = '#';
                hex.replace(/[0-9A-F]/ig, function (kw) {
                    sixHex += kw + kw; //把三位16进制数转化为六位
                });
                hex = sixHex; //保存回hex
            }
            if (/^#[0-9A-F]{6}$/i.test(hex)) { //判断传入是否为#六位十六进制数
                hex.replace(/[0-9A-F]{2}/ig, function (kw) {
                    rgb.push(eval('0x' + kw)); //十六进制转化为十进制并存如数组
                });
                if (a) {
                    return 'rgba(' + rgb.join(',') + ',' + a + ')'; //输出RGBA格式颜色
                }
                return 'rgb(' + rgb.join(',') + ')'; //输出RGB格式颜色
            } else {
                return 'rgb(0,0,0)';
            }
        };

        /**
         * 查看本地缓存是否存在photoKey
         * @param photoList
         * @param photoKey
         * @returns {boolean} true代表不存在
         */
        service.existPhoto = function (photoList, photoKey) {
            if (!photoList instanceof Array) return false;
            if (photoList.length === 0) return true;
            var existFlag = photoList.some(function (item) {
                return item === photoKey;
            });
            return !existFlag;
        };

        /**
         * 缓存照片photoKey
         * @param photoKey
         */
        service.saveLocalPhotoKey = function (photoKey) {
            if (!photoKey) return;
            var photoAry = $hyUtil.getLocal(TFConstant.LOCAL_PHOTO_ARY) || [];
            if (service.existPhoto(photoAry, photoKey)) {
                photoAry.push(photoKey);
                $hyUtil.saveLocal(TFConstant.LOCAL_PHOTO_ARY, photoAry);
            }
        };

        /**
         * 录入数字字符串类型
         * @param num
         */
        service.inputNumberStr = function (num) {
            var reg = /^[0-9]*([.][0-9]+)?$/;
            return reg.test(num);
        };

        /**
         * 结束时间小于开始时间
         * @param beginTimeStr 开始时间字符串
         * @param endTimeStr 结束时间字符串
         * @returns {boolean} 小于 true
         */
        service.isTimeBefore = function (beginTimeStr, endTimeStr) {
            beginTimeStr = beginTimeStr || NaN;
            endTimeStr = endTimeStr || NaN;
            var beginTime = new Date(beginTimeStr);
            var endTime = new Date(endTimeStr);
            return endTime < beginTime;
        };

        return service;
    }
]);
