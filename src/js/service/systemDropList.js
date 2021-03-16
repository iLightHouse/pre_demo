/**
 * 系统下拉初始化
 * Created by 刘克玉
 * 2017/3/4.
 */
app.factory('systemDropList', ['$hyHttp', '$appConfig', '$hyUtil', '$q', '$filter', 'ToolService', 'TFConstant',
    function ($hyHttp, $appConfig, $hyUtil, $q, $filter, ToolService, TFConstant) {
        // 获取下拉方式  1为使用时获取（XTZZ除外） 2为全量获取
        var getDropMode = 1;
        //系统下拉是否初始化的关键字
        var SYS_CODE_DROP = "__WGJL_SYSCODE_DROP";
        var SYS_CODE_INIT = "WGJL_SYSCODE_INIT";
        var SYS_DROP_VERSION = "WGJL_SYSCODE_VERSION";
        var SYS_DROP_PAGE_SIZE = 1500;
        var SYS_DROPING_LIST = {};
        var SP_DROP_LIST = []; //把需要通过存储过程获得下拉数据的代码编码配置到list中


        var systemDropList = {
            dropInfo: {},
            /**
             * 获取系统下拉是否初始化的状态
             * 0 未初始化
             * 1 初始化
             */
            isInit: function () {
                return JSON.parse(localStorage.getItem(SYS_CODE_INIT));
            },
            /**
             * 设置系统下拉初始化的状态
             * @param flag
             */
            setInit: function (flag) {
                localStorage.setItem(SYS_CODE_INIT, JSON.stringify(flag));
            },
            /**
             * 获取系统下拉的版本日期
             */
            getDropVersion: function () {
                return JSON.parse(localStorage.getItem(SYS_DROP_VERSION));
            },
            /**
             * 设置系统下拉版本日期
             * @param version_date
             */
            setDropVersion: function (version_date) {
                localStorage.setItem(SYS_DROP_VERSION, JSON.stringify(version_date));
            },
            /**
             * 获取系统下拉的请求参数
             * @returns {{json_params}}
             */
            getArgs: function (dmfl) {
                var params = {
                    ReceiveUnicodeEncoding_IN: {
                        dmfl: dmfl
                    }
                };
                return {
                    json_params: JSON.stringify(params)
                }
            },
            /**
             * 初始化方法
             */
            init: function () {
                var deferred = $q.defer();
                var self = this;
                if (getDropMode === 1) {
                    // localStorage.setItem(SYS_CODE_DROP, JSON.stringify({}));
                    // 初始化清空库表
                    DB_SYS_DROP_CODE.all().destroyAll(function () {
                        //下载保存组织信息
                        self.getYdglOrgInfo().then(function (list) {
                            self.saveQrgInfo(list).then(function () {
                                persistence.flush(function () {
                                    deferred.resolve();
                                });
                            }, function () {
                                persistence.flush(function () {
                                    deferred.resolve();
                                });
                            });
                        },function(){
                            deferred.reject();
                        }).then(function () {
                            persistence.flush(function () {
                                deferred.resolve();
                            });
                        });
                    });
                } else {
                    var userInfo = $appConfig.getUserInfo();
                    var oldUserAccount = this.isInit();

                    if (oldUserAccount && userInfo.DLZH != oldUserAccount) {//账号切换
                        //删除动态数据
                        self.delDynamicCodeInfos().then(function () {
                            self.initDropTree().then(function () {
                                self.delQrgInfo().then(function () {
                                    return self.getYdglOrgInfo();
                                }).then(function (list) {
                                    return self.saveQrgInfo(list);
                                }).then(function () {
                                    deferred.resolve();
                                });
                                //deferred.resolve();
                            }, function (msg) {
                                deferred.reject(msg);
                            }, function (page) {
                                deferred.notify(page);
                            });
                        }, function () {
                            deferred.reject('下拉数据初始化失败');
                        });
                    } else {
                        self.initDropTree().then(function () {
                            if (oldUserAccount) {
                                deferred.resolve();
                            } else {
                                self.delQrgInfo().then(function () {
                                    return self.getYdglOrgInfo();
                                }).then(function (list) {
                                    return self.saveQrgInfo(list);
                                }).then(function () {
                                    deferred.resolve();
                                });
                            }
                        }, function (msg) {
                            deferred.reject(msg);
                        }, function (page) {
                            deferred.notify(page);
                        });
                    }
                }
                return deferred.promise;
            },
            getDmflData: function (dmfl) {
                var drop = JSON.parse(localStorage.getItem(SYS_CODE_DROP));
                if (!drop) {
                    return null;
                }
                var dmflKey = drop[dmfl];
                if (!dmflKey) return null;
                return JSON.parse(localStorage.getItem(dmflKey));
            },
            setDmflData: function (dmfl, val) {
                var drop = JSON.parse(localStorage.getItem(SYS_CODE_DROP));
                drop = drop || {};
                var dmflKey = '_NWYDYX_DMFL_' + dmfl;
                drop[dmfl] = dmflKey;
                localStorage.setItem(SYS_CODE_DROP, JSON.stringify(drop));
                localStorage.setItem(dmflKey, JSON.stringify(val));
            },

            /**
             * 从JSON文件初始化系统下拉
             */
            initDropTree: function () {
                var deferred = $q.defer();
                var promise = deferred.promise;
                var self = this;
                var versionDate = this.getDropVersion();
                //如果没有初始化过，则进行首次下拉的初始化工作
                var userInfo = $appConfig.getUserInfo();
                this.getAllDropTreeData(userInfo, versionDate).then(function (data) {
                    // var delList = data.del;
                    // var updateList = data.update;
                    // var addList = data.add;
                    // self.delSysCodeInfos(delList).then(function () {
                    //     return self.updateSysCodeInfos(updateList);
                    // }).then(function () {
                    //     return self.addSysCodeInfos(addList);
                    // }).then(function () {
                    //     deferred.resolve();
                    // });
                    // self.delSysCodeInfos(delList);
                    // self.updateSysCodeInfos(updateList);
                    // self.addSysCodeInfos(addList);
                    self.setInit(userInfo.DLZH);
                    self.setDropVersion($filter('date')(new Date(), 'yyyy-MM-dd H:m:s'));
                    deferred.resolve();
                }, function () {
                    deferred.reject('下拉数据初始化失败');
                }, function (page) {
                    deferred.notify(page);
                });

                return promise;
            },
            getAllDropTreeData: function (userInfo, versionDate) {
                var pageSize = SYS_DROP_PAGE_SIZE;
                versionDate = versionDate || '1900-01-01 00:00:00';
                var page = arguments.length < 3 ? 1 : arguments[2];
                var totalPage = arguments.length < 4 ? 1 : arguments[3];
                var deferred = $q.defer();
                var dropTreeMap = arguments.length < 5 ? {add: [], update: [], del: []} : arguments[4];
                var self = this;
                try {
                    this.getDropTreeData(userInfo, versionDate, page, pageSize).then(function (data) {
                        if (!data || !data.pageInfo) {
                            deferred.reject();
                            return;
                        }
                        deferred.notify({page: page, totalPage: totalPage});
                        page++;
                        totalPage = data.pageInfo.allPageNum || 0;
                        // dropTreeMap.add = dropTreeMap.add || [];
                        // dropTreeMap.update = dropTreeMap.update || [];
                        // dropTreeMap.del = dropTreeMap.del || [];
                        // Array.prototype.push.apply(dropTreeMap.add, data.add || []);
                        // Array.prototype.push.apply(dropTreeMap.update, data.update || []);
                        // Array.prototype.push.apply(dropTreeMap.del, data.del || []);
                        self.delSysCodeInfos(data.del || []).then(function () {
                            return self.updateSysCodeInfos(data.update || []);
                        }).then(function () {
                            return self.addSysCodeInfos(data.add || []);
                        }).then(function () {
                            if (page > totalPage) {
                                deferred.resolve(dropTreeMap);
                            } else {
                                self.getAllDropTreeData(userInfo, versionDate, page, totalPage, dropTreeMap).then(function () {
                                    deferred.resolve(dropTreeMap);
                                }, function () {
                                    deferred.reject();
                                }, function (page) {
                                    deferred.notify(page);
                                });
                            }
                        });

                    }, function () {
                        deferred.reject();
                    });
                } catch (e) {
                    deferred.reject();
                }
                return deferred.promise;
            },
            /**
             * 分页获取下拉数据
             */
            getDropTreeData: function (userInfo, versionDate, page, pageSize) {
                var deferred = $q.defer();
                versionDate = versionDate || '1900-01-01 00:00:00';
                var dynamicDate = versionDate;
                var oldUserAccount = this.isInit();

                if (userInfo.DLZH != oldUserAccount) {//账号切换
                    //清除动态数据
                    dynamicDate = '1900-01-01 00:00:00';
                }

                var params = {
                    json_params: JSON.stringify({
                        action: 'getMobileTree',
                        dqbm: userInfo.DQBM,
                        gddwbm: userInfo.GDDWBM,
                        staticTime: versionDate,
                        dynamicTime: dynamicDate,
                        curPageNum: page,
                        rowOfPage: pageSize
                    })
                };

                $hyHttp.appPost('mobileTreeDrop', params)
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 通过ydgl获取组织信息
             */
            getYdglOrgInfo: function () {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'queryXtZzInfo',
                };
                var param = {
                    "partygroupid": 0
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        if (data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                data[i].zzbm = data[i].organizationId + "";
                                data[i].zzmc = data[i].groupName;
                                data[i].sjzzbm = data[i].upperOrganizationId;
                            }

                        } else {
                            data = [];
                        }
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 保存组织信息到下拉表
             * @param data
             */
            saveQrgInfo: function (data) {
                var deferred = $q.defer();
                if (!data) {
                    deferred.resolve();
                    return deferred.promise;
                }
                for (var i = 0; i < data.length; i++) {
                    var info = new DB_SYS_DROP_CODE({
                        UNIQUEIDEN: 'ZZXX:' + data[i].zzbm,  //主键标识
                        DMBMBS: data[i].zzbm,  //代码编码标识
                        DMFLBS: '',  //代码分类标识
                        SJDMBMBS: data[i].sjzzbm,  //上级代码编码标识
                        DMFL: 'ZZXX',  //代码分类
                        DMBM: data[i].zzbm,  //代码编码
                        DMBMMC: data[i].zzmc,  //代码编码名称
                        SJLY: 'dynamic'  //数据来源 static：静态 dynamic：动态
                    });
                    persistence.add(info);
                }
                persistence.flush(function () {
                    deferred.resolve();
                });
                return deferred.promise;
            },
            /**
             * 删除组织信息
             */
            delQrgInfo: function () {
                var deferred = $q.defer();
                DB_SYS_DROP_CODE.all().filter('DMFL', '=', 'ZZXX').list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });

                });
                return deferred.promise;
            },

            /**
             *  根据代码分类获取数据
             * @param dmfl
             * @returns {*}
             */
            getDropInfoList: function (dmfl) {
                var deferred = $q.defer();
                var self = this;
                var getArgs = arguments;
                dmfl = dmfl.toUpperCase();
                if (getDropMode === 2 || (getDropMode === 1 && dmfl === 'ZZXX')) {
                    //组织
                    self.getDropInfoListByLocal.apply(self, getArgs).then(function (list) {
                        deferred.resolve(list);
                    }, function () {
                        deferred.reject();
                    });
                } else {
                    self.getDropInfoListByServer.apply(self, getArgs).then(function (res) {
                        deferred.resolve(res);
                    }, function () {
                        deferred.reject();
                    });
                }

                return deferred.promise;
            },

            /**
             *  根据代码分类获取数据
             * @param dmfl
             * @returns {*}
             */
            getDropInfoListByServer: function (dmfl) {
                dmfl = dmfl || '';
                dmfl = dmfl.toUpperCase();
                var deferred = $q.defer();
                var getArgs = arguments;
                var self = this;
                var listData = self.getDmflData(dmfl);
                if (listData) {
                    deferred.resolve(self.filterData(listData, getArgs));
                    return deferred.promise;
                }
                if (SYS_DROPING_LIST[dmfl]) {//是否在请求缓存中
                    SYS_DROPING_LIST[dmfl].push({deferred: deferred, args: getArgs});
                } else {
                    /**
                     * 如果dmfl符合SP_DROP_LIST里已经配置的dmbm那就通过存储过程调用，
                     * 如果不符合那就通过接口调用
                     */
                    var promise;
                    if (SP_DROP_LIST.indexOf(dmfl) > -1) {
                        promise = self.getDropDataList(dmfl, deferred);  //通过存储过程获取下拉翻译内容
                    } else {
                        promise = self.getDropOptions(dmfl, deferred); //通过接口获取下拉翻译内容
                    }
                    promise.then(function (data) {
                        self.setDmflData(dmfl, data);
                        deferred.resolve(self.filterData(data, getArgs));
                        if (SYS_DROPING_LIST[dmfl]) {
                            for (var i = 0; i < SYS_DROPING_LIST[dmfl].length; i++) {
                                var deferredItem = SYS_DROPING_LIST[dmfl][i].deferred;
                                var args = SYS_DROPING_LIST[dmfl][i].args;
                                deferredItem.resolve(self.filterData(data, args));
                            }
                        }
                        SYS_DROPING_LIST[dmfl] = null;
                    }, function () {
                        deferred.reject();
                        if (SYS_DROPING_LIST[dmfl]) {
                            for (var i = 0; i < SYS_DROPING_LIST[dmfl].length; i++) {
                                var deferredItem = SYS_DROPING_LIST[dmfl][i].deferred;
                                deferredItem.reject();
                            }
                        }
                        SYS_DROPING_LIST[dmfl] = null;
                    })
                }
                return deferred.promise;
            },
            /**
             * 通过接口获取下拉翻译内容
             * @param dmfl
             * @returns {s}
             */
            getDropOptions: function (dmfl) {
                dmfl = dmfl || '';
                dmfl = dmfl.toUpperCase();
                var deferred = $q.defer();
                var param = {
                    "extcode": dmfl
                };
                var serviceUrl = {
                    url: TFConstant.KF_QC_URL,
                    serviceName: 'appQueryXtDmbmInfo',
                };
                $hyHttp.appPost(serviceUrl, param)
                    .then(function (data) {
                        if (data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                data[i].dmfl = data[i].extcode;
                                data[i].dmbm = data[i].paramcode;
                                data[i].dmbmmc = data[i].paramvalue;
                                data[i].yycj1 = data[i].filter;
                                data[i].sjdmbmbs = data[i].filter;
                            }
                        }
                        deferred.resolve(data);
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },

            /**
             * 通过存储过程获取下拉翻译内容
             * @param dmfl
             * @param deferred
             * @returns {s}
             */
            getDropDataList: function (dmfl, deferred) {
                dmfl = dmfl || '';
                dmfl = dmfl.toUpperCase();
                var self = this;
                deferred = deferred || $q.defer();
                var listData = {};
                var param = {
                    param1: 'SYSTEMDROP',
                    param5: dmfl //借用WGBS来传递属性代码
                };
                var proceQueryParams = {
                    dealName: 'YD_P_WGZBTJ',
                    paramList: param
                };
                ToolService.dealProce(proceQueryParams).then(function (data) {
                    var dataGroup = [];
                    if (data && data.response1 == 'OK') {
                        var list = $hyUtil.convertToArray(data.response3 || []);
                        dataGroup = list.map(function (item) {
                            return {
                                'DMBM': item.param1,     //将param1赋值给DMBM
                                'DMBMMC': item.param2,   //将param2赋值给DMBMMC
                                'FILTER': item.param3    //将param3赋值给FILTER
                            };
                        });
                    }
                    deferred.resolve(dataGroup);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },


            getNewDropList: function (list) {
                list = list || [];
                var res = [];
                for (var i = 0; i < list.length; i++) {
                    var info = {
                        UNIQUEIDEN: list[i].uniqueIden,  //主键标识
                        DMBMBS: list[i].dmbmbs,  //代码编码标识
                        DMFLBS: list[i].dmflbs,  //代码分类标识
                        SJDMBMBS: list[i].sjdmbmbs,  //上级代码编码标识
                        DMFL: list[i].dmfl,  //代码分类
                        DMBMNM: list[i].dmbmnm,  //代码编码内码
                        DMBM: list[i].dmbm,  //代码编码
                        DMBMMC: list[i].dmbmmc,  //代码编码名称
                        XSSX: list[i].xssx,  //显示顺序
                        KXBZ: list[i].kxbz,  //可选标志
                        SJLY: list[i].sjly,  //数据来源 static：静态 dynamic：动态
                        YYCJ1: list[i].yycj1,  //应用场景1
                        YYCJ2: list[i].yycj2,  //应用场景2
                        YYCJ3: list[i].yycj3,  //应用场景3
                        YYCJ4: list[i].yycj4,  //应用场景4
                        YYCJ5: list[i].yycj5,  //应用场景5
                        DZGX1: list[i].dzgx1,  //对照关系1
                        DZGX2: list[i].dzgx2,  //对照关系2
                        DZGX3: list[i].dzgx3  //对照关系3
                    };
                    res.push(info);
                }
                return res;
            },
            /**
             *
             * @param list
             * @param params
             * @returns {[]}
             */
            filterData: function (list, params) {
                var self = this;
                var markFn = function (val, mark, value) {
                    mark = mark || '=';
                    var res = false;
                    switch (mark) {
                        case '<':
                            res = val < value;
                            break;
                        case '>':
                            res = val > value;
                            break;
                        case '!=':
                            res = val != value;
                            break;
                        case 'in':
                            res = value.indexOf(val) >= 0;
                            break;
                        case 'not in':
                            res = value.indexOf(val) < 0;
                            break;
                        case 'like':
                            if (value.startsWith('%') && value.endsWith('%')) {
                                res = val.indexOf(value.substring(1, value.length - 1)) >= 0;
                            } else if (value.startsWith('%')) {
                                res = val.startsWith(value.substring(1));
                            } else if (value.endsWith('%')) {
                                res = val.endsWith(value.substring(0, value.length - 1));
                            } else {
                                res = val == value;
                            }
                            break;
                        default:
                            res = val == value;
                            break;
                    }
                    return res;
                };
                list = list || [];
                var res = list.filter(function (item) {
                    var check = true;
                    if (params && params.length > 1) {
                        for (var i = 1; i < params.length; i++) {
                            var param = params[i];
                            if (!param) continue;
                            var key = param.key.toLowerCase();
                            var val = param.value;
                            var operate = param.operate || '=';
                            check = check && item && markFn(item[key], operate, val);
                        }
                    }
                    return check;
                });
                return self.getNewDropList(res);
            },
            /**
             *  根据代码分类从本地获取数据
             * @param dmfl
             * @returns {*}
             */
            getDropInfoListByLocal: function (dmfl) {
                dmfl = dmfl || '';
                var deferred = $q.defer();
                var queryCollection = DB_SYS_DROP_CODE.all().filter('DMFL', '=', dmfl);
                if (arguments && arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        var param = arguments[i];
                        if (!param) continue;
                        queryCollection = queryCollection.and(new persistence.PropertyFilter(param.key, param.operate || '=', param.value));
                    }
                }
                queryCollection.list(function (results) {
                    deferred.resolve(results);
                });
                return deferred.promise;
            },
            /**
             *  根据代码分类获取数据
             * @param dmfl
             * @returns {*}
             */
            getfilterDropInfoList: function (dmfl, key, mark, value) {
                dmfl = dmfl || '';
                var deferred = $q.defer();
                this.getDropInfoList(dmfl, {key: key, operate: mark, value: value}).then(function (data) {
                    var list = data || [];
                    deferred.resolve(list);
                }, function () {
                    deferred.reject();
                });

                return deferred.promise;
            },
            /**
             *  根据代码分类/代码编码获取数据
             * @param dmfl
             * @returns {*}
             */
            getDropInfo: function (dmfl, dmbm) {
                dmfl = dmfl || '';
                dmbm = dmbm || '';
                var deferred = $q.defer();
                this.getDropInfoList(dmfl, {key: 'dmbm', value: dmbm}).then(function (data) {
                    var list = data || [];
                    deferred.resolve(list);
                }, function () {
                    deferred.reject();
                });

                return deferred.promise;
            },

            /**
             *  根据代码分类/代码编码获取数据DMBMMC
             * @param dmfl
             * @returns {*}
             */
            getDropLable: function (dmfl, dmbm) {
                dmfl = dmfl || '';
                dmbm = dmbm || '';
                var deferred = $q.defer();
                this.getDropInfo(dmfl, dmbm).then(function (list) {
                    var label = '';
                    if (list && list.length > 0) {
                        label = list[0].DMBMMC;
                    }
                    deferred.resolve(label);
                }, function () {
                    deferred.resolve('');
                });
                return deferred.promise;
            },

            /**
             * 添加系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            addSysCodeInfo: function (sysCodeInfo) {
                var deferred = $q.defer();
                var sys_drop_code = new DB_SYS_DROP_CODE(sysCodeInfo);
                persistence.add(sys_drop_code);
                persistence.flush(function () {
                    deferred.resolve(sys_drop_code);
                });
                return deferred.promise;
            },


            /**
             * 批量添加系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            addSysCodeInfos: function (sysCodeInfos) {
                var deferred = $q.defer();
                for (var i = 0; i < sysCodeInfos.length; i++) {
                    var info = new DB_SYS_DROP_CODE({
                        UNIQUEIDEN: sysCodeInfos[i].uniqueIden,  //主键标识
                        DMBMBS: sysCodeInfos[i].dmbmbs,  //代码编码标识
                        DMFLBS: sysCodeInfos[i].dmflbs,  //代码分类标识
                        SJDMBMBS: sysCodeInfos[i].sjdmbmbs,  //上级代码编码标识
                        DMFL: sysCodeInfos[i].dmfl,  //代码分类
                        DMBMNM: sysCodeInfos[i].dmbmnm,  //代码编码内码
                        DMBM: sysCodeInfos[i].dmbm,  //代码编码
                        DMBMMC: sysCodeInfos[i].dmbmmc,  //代码编码名称
                        XSSX: sysCodeInfos[i].xssx,  //显示顺序
                        KXBZ: sysCodeInfos[i].kxbz,  //可选标志
                        SJLY: sysCodeInfos[i].sjly,  //数据来源 static：静态 dynamic：动态
                        YYCJ1: sysCodeInfos[i].yycj1,  //应用场景1
                        YYCJ2: sysCodeInfos[i].yycj2,  //应用场景2
                        YYCJ3: sysCodeInfos[i].yycj3,  //应用场景3
                        YYCJ4: sysCodeInfos[i].yycj4,  //应用场景4
                        YYCJ5: sysCodeInfos[i].yycj5,  //应用场景5
                        DZGX1: sysCodeInfos[i].dzgx1,  //对照关系1
                        DZGX2: sysCodeInfos[i].dzgx2,  //对照关系2
                        DZGX3: sysCodeInfos[i].dzgx3  //对照关系3
                    });
                    persistence.add(info);
                }
                persistence.flush(function () {
                    deferred.resolve();
                });
                return deferred.promise;
            },
            /**
             * 删除系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            delSysCodeInfoByDmfl: function (dmfl) {
                var deferred = $q.defer();
                DB_SYS_DROP_CODE.all().filter("DMFL", '=', dmfl).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            },
            /**
             * 更新系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            updateSysCodeInfo: function (sysCodeInfo) {
                var deferred = $q.defer();
                var self = this;
                this.delSysCodeInfo(sysCodeInfo).then(function () {
                    self.addSysCodeInfo(sysCodeInfo).then(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            },
            /**
             * 批量更新系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            updateSysCodeInfos: function (sysCodeInfos) {
                var deferred = $q.defer();
                var self = this;
                this.delSysCodeInfos(sysCodeInfos).then(function () {
                    self.addSysCodeInfos(sysCodeInfos).then(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            },
            /**
             * 删除系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            delSysCodeInfo: function (sysCodeInfo) {
                var deferred = $q.defer();
                DB_SYS_DROP_CODE.all().filter("UNIQUEIDEN", '=', sysCodeInfo.uniqueIden).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            },
            /**
             * 批量删除系统下拉数据到数据库中
             * @param sysCodeInfo
             */
            delSysCodeInfos: function (sysCodeInfos) {
                var deferred = $q.defer();
                var idList = [];
                for (var i = 0; i < sysCodeInfos.length; i++) {
                    idList.push(sysCodeInfos[i].uniqueIden);
                }
                DB_SYS_DROP_CODE.all().filter("UNIQUEIDEN", 'in', idList).list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            },
            /**
             * 清除动态下拉数据
             */
            delDynamicCodeInfos: function () {
                var deferred = $q.defer();
                DB_SYS_DROP_CODE.all().filter('SJLY', '=', 'dynamic').list(function (results) {
                    results.forEach(function (r) {
                        persistence.remove(r);
                    });
                    persistence.flush(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            },
            /**
             * 通过人员标识查询人员信息
             * @param param
             * @returns {Promise}
             * @constructor
             */
            queryUserInfo: function (rybs) {
                var deferred = $q.defer();
                var ryxx = {};
                if (rybs) {
                    var serviceUrl = {
                        url: TFConstant.KF_QC_URL,
                        serviceName: 'queryXtRyInfo',
                    };
                    var param = {
                        "loginId": rybs
                    };
                    $hyHttp.appPost(serviceUrl, param)
                        .then(function (data) {
                            if (data && data.length > 0) {
                                ryxx = {rymc: data[0].personName || rybs, rybs: rybs};
                            }
                            deferred.resolve(ryxx);
                        }, function () {
                            deferred.reject();
                        });
                }
                return deferred.promise;
            },
            /**
             * 通过业务类别查询业务类别名称
             * @param param
             * @returns {Promise}
             * @constructor
             */
            queryYwlbInfo: function (ywlbdm) {
                var deferred = $q.defer();
                var ywlb = {};
                if (ywlbdm) {
                    var serviceUrl = {
                        url: TFConstant.KF_QC_URL,
                        serviceName: 'queryXtYwlbInfo'
                    };
                    var param = {
                        "busicatgqryVo": {
                            "busicatgcd": ywlbdm
                        }
                    };
                    $hyHttp.appPost(serviceUrl, param)
                        .then(function (data) {
                            if (data && data.busicatglistVoList && data.busicatglistVoList.length > 0) {
                                ywlb = {
                                    ywlbmc: data.busicatglistVoList[0].busicatgnm || ywlbdm,
                                    ywlbdm: ywlbdm,
                                    ywlbdmen: data.busicatglistVoList[0].busicatgenm,
                                    sjywlbdm: data.busicatglistVoList[0].highlvlbuscatgcd
                                };
                            }
                            deferred.resolve(ywlb);
                        }, function () {
                            deferred.reject();
                        });
                }
                return deferred.promise;
            },
            /**
             * 创建业务类别下拉
             * @param busicatgcd
             * @returns {PromiseLike<any> | Promise | s}
             */
            createYwlbDrop: function (busicatgcd) {
                var deferred = $q.defer();
                if (busicatgcd) {
                    var serviceUrl = {
                        url: TFConstant.KF_QC_URL,
                        serviceName: 'queryXtYwlbInfo'
                    };
                    var param = {
                        "busicatgqryVo": {
                            "busicatgcd": busicatgcd
                        }
                    };
                    var self = this;
                    $hyHttp.appPost(serviceUrl, param).then(function (data) {
                        if (data && data.busicatglistVoList && data.busicatglistVoList.length > 0) {
                            var ywlbAry = [];
                            data.busicatglistVoList.forEach(function (item) {
                                var ywlbObj = {
                                    dmbmmc: item.busicatgnm || item.busicatgcd,
                                    dmbm: item.busicatgcd,
                                    ywlbdmen: item.busicatgenm,
                                    sjywlbdm: item.highlvlbuscatgcd,
                                    dmfl: 'CCSBUSICATG',
                                    extcode: 'CCSBUSICATG'
                                };
                                ywlbAry.push(ywlbObj);
                            });
                            self.setDmflData('CCSBUSICATG', ywlbAry);
                            deferred.resolve('success');
                        }
                    }, function () {
                        deferred.reject();
                    });
                }
                return deferred.promise;
            }

        };
        return systemDropList;
    }]);