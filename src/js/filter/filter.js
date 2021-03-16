/**
 * Version:1.0.0
 * Author:高飞
 * Date:2018/1/30
 * 过滤器
 */
app.filter('cutYHBH', ['$filter', function ($filter) {
    return function (YHBH) {
        //if(!YHBH || YHBH.length <= 6){
        //    return YHBH;
        //}
        //var result = YHBH.substring(YHBH.length - 6);
        //return '**' + result;
        return YHBH;
    };
}]);
app.filter('cutYHMC', ['$filter', function ($filter) {
    return function (YHMC) {
        if (!YHMC || YHMC.length <= 1) {
            return YHMC;
        }
        if (YHMC.length === 2) {
            return '*' + YHMC.substring(1, 2);
        }
        var resultStart = YHMC.substring(0, 1);
        var resultEnd = YHMC.substring(YHMC.length - 1);
        var mid = '';
        while (mid.length < YHMC.length - 2) {
            mid += '*';
        }
        return resultStart + mid + resultEnd;
    };
}]);
app.filter('cutYDDZ', ['$filter', function ($filter) {
    return function (YDDZ) {
        if (!YDDZ || YDDZ.length <= 4) {
            return YDDZ;
        }
        var resultStart = YDDZ.substring(0, 2);
        var resultEnd = YDDZ.substring(YDDZ.length - 2);
        var mid = '';
        while (mid.length < YDDZ.length - 4) {
            mid += '*';
        }
        return resultStart + mid + resultEnd;
    };
}]);
/**
 * 格式化距离显示（**m/km）
 */
app.filter('formatLength', ['$filter', function ($filter) {
    return function (length) {
        if (!length || length.length <= 0) {
            return length;
        }
        if (!angular.isNumber(length)) {
            return length;
        }
        if (length > 1000) {
            return (length / 1000).toFixed(2) + 'km';
        } else {
            return length.toFixed(0) + 'm';
        }
    };
}]);

app.filter('modifyDate', ['$filter', function ($filter) {
    return function (DFNY) {
        if (!DFNY || DFNY.length <= 4) {
            return DFNY;
        }

        var date1 = DFNY.substring(0, 4);
        var date2;
        if (DFNY.length == 5) date2 = DFNY.substring(DFNY.length - 1);
        if (DFNY.length == 6) date2 = DFNY.substring(DFNY.length - 2);
        return date1 + '-' + date2;
    };
}]);

app.filter('cutDetailDate', ['$filter', function ($filter) {
    return function (JFSJ) {
        if (!JFSJ || JFSJ.length <= 20) {
            return JFSJ;
        }

        var resultDate = JFSJ.substring(0, JFSJ.length - 2);
        return resultDate;
    };
}]);

app.filter('modifyTimeStamp', ['$filter', function ($filter) {
    return function (JCRQ) {
        if (!JCRQ || JCRQ.length <= 0) {
            return JCRQ;
        }
        var year = JCRQ.substring(0, 4);
        var month = JCRQ.substring(5, 7);
        var date = JCRQ.substring(8, 10);
        var allDate = date + " / " + month + " / " + year;
        return allDate;
    };
}]);
app.filter('splitMoney', ['$filter', function ($filter) {
    return function (money, type) {
        if (!money || !type) {
            return '0';
        }
        money = String(money);
        var arr = [];
        if (money.indexOf(".") == -1) {
            arr[0] = money;
            arr[1] = '00';
        } else {
            arr = money.split('.');
        }
        if ('yuan' == type) {
            return arr[0];
        }
        if ('fen' == type) {
            return arr[1];
        }
        return '0';
    };
}]);
/**
 * 处理金额显示，小于一万直接返回，否则返回***万，不包括万
 */
app.filter('formatMoney', ['$filter', function ($filter) {
    return function (money, type) {
        var res = '';
        if (!money || isNaN(money)) {
            res = '0.00';
        } else {
            if (Number(money) < 10000) {
                res = String(money);
            } else {
                res = String(Number(money) / 10000);
            }
        }
        var arr = [];
        if (res.indexOf(".") === -1) {
            arr[0] = res;
            arr[1] = '00';
        } else {
            arr = res.split('.');
            if (arr[1].length > 2) {
                arr[1] = arr[1].substring(0, 2);
            }
        }
        if ('2' == type) {
            return arr[1];
        } else {
            return arr[0];
        }
    };
}]);
app.filter('hyDateFormat', ['$filter', function ($filter) {
    return function (input, format) {
        if (!input || input.length <= 0) {
            return '';
        }
        var dateParse = Date.parse(input.toString().replace(/\-/g, '\/'));
        if (isNaN(dateParse))
            input = new Date();
        else
            input = new Date(dateParse);

        var date = $filter('date')(input, format);
        return date;
    };
}]);

app.filter('FYNYDate', ['$filter', function ($filter) {
    return function (DFNY) {
        if (!DFNY || DFNY.length < 6) {
            return DFNY;
        }

        var resultDate = DFNY.substring(0, 4) + '年';
        if (DFNY.substring(4, 5) == '0') {
            resultDate += DFNY.substring(5, 6) + '月'
        } else {
            resultDate += DFNY.substring(4, 6) + '月'
        }

        return resultDate;
    };


}]);

app.filter('FYNYDay', ['$filter', function ($filter) {
    return function (DFNY) {
        if (!DFNY || DFNY.length < 6) {
            return DFNY;
        }
        return DFNY.substring(0, 10);
        //var resultDate = DFNY.substring(0, 4) + '年';
        //if (DFNY.substring(5,6) == '0') {
        //    resultDate += DFNY.substring(6, 7) + '月'
        //} else {
        //    resultDate += DFNY.substring(5, 7) + '月'
        //}
        //
        //if (DFNY.substring(8,9) == '0') {
        //    resultDate += DFNY.substring(9,10) + '日'
        //} else {
        //    resultDate += DFNY.substring(8, 10) + '日'
        //}
        //return resultDate;
    };


}]);
/**
 * 格式化数量显示
 */
app.filter('formatNumber', ['$filter',
    function ($filter) {
        return function (num) {
            if (!num || num.length <= 0) {
                return num;
            }
            if (!angular.isNumber(num)) {
                return num;
            }
            if (num >= 10000 && num < 11000) {
                return '1万';
            }
            if (num >= 11000) {
                return (num / 10000).toFixed(1) + '万';
            } else {
                return num;
            }
        };
    }]);
/**
 * 格式化百分比显示（**m/km）
 */
app.filter('formatPercent', ['$filter',
    function ($filter) {
        return function (num) {
            if (!num || num.length <= 0) {
                return num;
            }
            if (!angular.isNumber(num)) {
                return num;
            }
            if (num < 0) {
                num = -num;
            }
            if (num === 0) {
                return 0;
            } else if (num === 1) {
                return (num * 100).toFixed(1).replace('.0', '');
            } else {
                return (num * 100).toFixed(1);
            }
        };
    }]);
/**
 * 工单是否可以办理
 */
app.filter('checkWorkOrder', ['$filter', 'MenuService',
    function ($filter, MenuService) {
        return function (item) {
            if (!item) {
                return false;
            }
            var data = MenuService.getCheckWorkOrderData();
            if (data[item.bzhjh] === 1) {
                return true;
            } else if (data[item.bzhjh]) {
                return data[item.bzhjh].indexOf(item.ywzldm) > -1;
            }
            return false;
        };
    }]);
/**
 * 工单是否可以办理
 */
app.filter('getTaskCount', ['$filter',
    function ($filter) {
        return function (task, list) {
            var count = 0;
            if (!task || !list || list.length < 0) return 0;
            list.forEach(function (item) {
                if (task.bzhjh.includes(item.bzhjh)) {
                    count++;
                }
            });
            return count;
        };
    }]);

/**
 * 编号去零
 * '0000101'转为'101'
 */
app.filter('shortenNumber', ['$filter',
    function ($filter) {
        return function (num) {
            if (zeroPadding) return num;// 是否开启去零操作，true不开启
            if (!num) return '';
            if (isNaN(num)) {
                var zeroNum = 0;
                for (var i = 0; i < num.length; i++) {
                    if (num[i] === '0') {
                        zeroNum++;
                    } else {
                        break;
                    }
                }
                if (zeroNum > 0) {
                    num = num.substr(zeroNum);
                }
                return num;
            } else {
                return String(Number(num));
            }
        };
    }]);

/**
 * 编号补零
 * len 编号位数
 * num 编号
 */
app.filter('lengthenNumber', ['$filter',
    function ($filter) {
        return function (len, num) {
            if (zeroPadding) return num;// 是否开启补零操作，true不开启
            if (!num) return num;// 不存在则返回
            if (isNaN(num)) return num;
            var finalNum = len - String(num).length;
            var zero = '';
            for (var i = 0; i < finalNum; i++) {
                zero += '0';
            }
            return zero + num;
        };
    }]);
