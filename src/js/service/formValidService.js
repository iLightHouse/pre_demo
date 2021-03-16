/**
 * Created by ym on 2017/5/5.
 * Modify by ym on 2017/11/08
 *
 * 表单验证服务
 * 处理是否未空，正则表达式，条件判空的表单验证类型
 *
 */
app.factory('FormValidService', ['$q', '$hyUtil', function ($q, $hyUtil) {

    var formValidService = {
        /*手机号正则表达式*/
        PHONE_PATTERN: /^(1[34578]\d{9})$/,
        /*座机电话号码的正则表达式*/
        TELEPHONE_PATTERN: /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/,
        /*长度8-16位的密码字母数字组合的正则表达式*/
        PASSWORD_PATTERN: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
        /*身份证的正则表达式*/
        IDCARD_PATTERN: /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i,
        NC_PATTERN: /^(?!\d)[a-zA-Z0-9\u4e00-\u9fa5]{2,16}$/,

        alert: function (msg) {
            hyMui.toast({message: msg});
        },
        /**
         * 判断对象中数据是否为空，并进行提示
         * 判断是否在长度范围标准内
         * 判断是否满足正则表达式
         * @param Info 要判断的对象
         * @param checkList 判断的规则
         * @returns {boolean}
         */
        isEmptyAlert: function (Info, checkList) {
            for (var i = 0; i < checkList.length; i++) {
                if ($hyUtil.isEmpty(Info[checkList[i]['FIELD']])) {
                    formValidService.alert(checkList[i]['TITLE'] + "不能为空!");
                    return true;
                }
                if (checkList[i].hasOwnProperty('LENGTH')) {
                    var length = checkList[i]['LENGTH'];
                    if (typeof length === 'number') {
                        if (Info[checkList[i]['FIELD']].length !== length) {
                            formValidService.alert(checkList[i]['TITLE'] + "长度应该是" + length + "位");
                            return true;
                        }
                    } else {
                        if (Info[checkList[i]['FIELD']].length < length.min ||
                            Info[checkList[i]['FIELD']].length > length.max) {
                            formValidService.alert(checkList[i]['TITLE'] + "长度应该在"
                                + length.min + "~" + length.max + "之间");
                            return true;
                        }
                    }
                }
                if (checkList[i].hasOwnProperty('PATTERN') && !checkList[i]['PATTERN'].test(Info[checkList[i]['FIELD']])) {
                    formValidService.alert(checkList[i]['TITLE'] + "格式不正确!");
                    return true;
                }
            }
            return false;
        },
        /**
         * 根据对象中某个字段的值等于指定的数值情况下
         * 判断指定检查列表中的字段进行处理
         * @param Info  要判断的对象
         * @param checkList 判断的规则
         * @returns {boolean}
         */
        isEqualAndEmptyAlert: function (Info, checkList) {
            for (var i = 0; i < checkList.length; i++) {
                if (Info[checkList[i]['FIELD']] === checkList[i]['VALUE']) {
                    var _checkList = checkList[i]['CHECK_LIST'];
                    for (var j = 0; j < _checkList.length; j++) {
                        var field = _checkList[j]['FIELD'];
                        if ($hyUtil.isEmpty(Info[field])) {
                            formValidService.alert(_checkList[j]['TITLE'] + "不能为空");
                            return true;
                        }
                        if (_checkList[j].hasOwnProperty('PATTERN') && !_checkList[j]['PATTERN'].test(Info[field])) {
                            formValidService.alert(_checkList[j]['TITLE'] + "格式不正确!");
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        /**
         * 判断对象中数据是否符合正则表达式
         * @param Info  要判断的对象
         * @param checkList 判断的规则
         * @returns {boolean}
         */
        isPatternCheck: function (Info, checkList) {
            for (var i = 0; i < checkList.length; i++) {
                if (!$hyUtil.isEmpty(Info[checkList[i]['FIELD']])) {
                    if(checkList[i].hasOwnProperty('PATTERN') && !checkList[i]['PATTERN'].test(Info[checkList[i]['FIELD']])){
                        formValidService.alert(checkList[i]['TITLE'] + "格式不正确!");
                        return true;
                    }
                }
            }
        }
    };
    return formValidService;
}]);