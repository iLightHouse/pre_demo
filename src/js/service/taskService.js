app.factory('TaskService', ['$rootScope', '$hyHttp', '$appConfig', 'TFConstant', '$hyUtil', '$q', '$hyDateLocale', '$http', 'MenuService', '$filter',
    function ($rootScope, $hyHttp, $appConfig, TFConstant, $hyUtil, $q, $hyDateLocale, $http, MenuService, $filter) {
        var configJson = $appConfig.configJson || {};
        //为了满足FTP附件上传及营销移动运行平台服务的情况，在服务中指定FTP附件上传的URL地址;
        var FILE_UPLOAD_URL = $appConfig.appUrl + "?hy_serviceName=empFileUpload&hy_appId=" + $appConfig.appId + "&hy_version=" + configJson.appVersion;
        FILE_UPLOAD_URL = FILE_UPLOAD_URL.replace('serviceInvoke.do', 'servlet/FileUploadServlet');
        //获取标准环节号
        var bzhjhList = MenuService.getAllBzhjh();
        var DBQS_BZHJH = bzhjhList.join(',');
        var taskService = {
            IMAGE_MAX_NUM: 6,
            isTaskListInit: false,
            SPYJ: [
                {
                    id: '1',
                    title: "同意"
                },
                {
                    id: '0',
                    title: "不同意"
                }
            ],
            /**
             * 发送任务列表变化的广播通知
             */
            _broadTaskChange: function () {
                $rootScope.$broadcast("TASK_CHANGE");
            },

            /**
             * 默认查询当前用户的待办列表
             */
            getTaskList: function (bzhjh) {
                var self = this;
                var deferred = $q.defer();
                $hyHttp.appPost('webService', {
                    'serverName': 'QueryAgentList',
                    'rc_head': 'QueryAgentListRequest',
                    'rc_body': JSON.stringify({
                        'QueryAgentList_InType': {
                            'czrbs': $appConfig.userInfo.RYBS,
                            'cxlb': '2',
                            'dqbm': $appConfig.userInfo.DQBM,
                            'bzhjh': bzhjh
                        }
                    })
                }).then(function (data) {
                    var list = [];
                    if (data && data.QueryAgentList_Out) {
                        //由于营销系统中的接口如果数据是一条返回的是object，所以需要进行数组转换
                        list = $hyUtil.convertToArray(data.QueryAgentList_Out);
                    }
                    var gzdbhList = [];
                    for (var i = 0; i < list.length; i++) {
                        gzdbhList.push(list[i].gzdbh);
                    }
                    ggmk_db.all().list(function (results) {
                        results.forEach(function (r) {
                            if (gzdbhList.indexOf(r.gzdbh) >= 0) {
                                persistence.remove(r);
                            }
                        });
                        persistence.flush(function () {
                            for (i = 0; i < list.length; i++) {
                                persistence.add(new ggmk_db(list[i]));
                            }
                            persistence.flush();
                        });
                    });
                    self.isTaskListInit = true;
                    deferred.resolve(list);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 默认查询当前用户所有的待办列表
             */
            getAllTaskList: function (size, page, param) {
                var self = this;
                var deferred = $q.defer();
                param = param || {};
                $hyHttp.appPost('webService', {
                    'serverName': 'QueryAllAgentList',
                    'rc_head': 'QueryAllAgentListRequest',
                    'rc_body': JSON.stringify({
                        'QueryAllAgentList_InType': {
                            'czrbs': $appConfig.userInfo.RYBS,
                            'cxlb': '1',
                            'zzbm': $appConfig.userInfo.ZZBM,
                            'gddwbm': $appConfig.userInfo.GDDWBM,
                            'RowOfPage': size || 20,
                            'CurPageNum': page || 1,
                            'gzdbh': param.gzdbh || '',
                            'gzdzy': param.gzdzy || '',
                            'hjmc': param.hjmc || '',
                            'ywfl': param.ywfl || '',
                            'ywlb': param.ywlb || '',
                            'ywzl': param.ywzl || ''
                        }
                    })
                }).then(function (data) {
                    if (data && data.QueryAllAgentList_Out) {
                        //由于营销系统中的接口如果数据是一条返回的是object，所以需要进行数组转换
                        data.QueryAllAgentList_Out = $hyUtil.convertToArray(data.QueryAllAgentList_Out);
                    }
                    self.isTaskListInit = true;
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询当前用户的签收列表
             * @returns {Promise}
             */
            getQsTaskList: function (bzhjhList) {
                bzhjhList = bzhjhList || [];
                if (bzhjhList.length <= 0) {
                    bzhjhList = DBQS_BZHJH;
                }
                var deferred = $q.defer();
                $hyHttp.appPost('webService', {
                    'serverName': 'QueryAgentList',
                    'rc_head': 'QueryAgentListRequest',
                    'rc_body': JSON.stringify({
                        'QueryAgentList_InType': {
                            'czrbs': $appConfig.userInfo.RYBS,
                            'cxlb': '1',
                            'dqbm': '',
                            'bzhjh': bzhjhList
                        }
                    })
                }).then(function (data) {
                    var res = [];
                    if (data.QueryAgentList_Out) {
                        res = $hyUtil.convertToArray(data.QueryAgentList_Out);
                    }
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 签收工单
             * @param task
             * @returns {Promise}
             */
            qsTask: function (task) {
                var deferred = $q.defer();
                $hyHttp.appPost('webService', {
                    'serverName': 'SignTaskList',
                    'rc_head': 'SignTaskListRequest',
                    'rc_body': JSON.stringify({
                        'SignTaskList_In': {
                            'czrbs': $appConfig.userInfo.RYBS,
                            'gzdbh': task.gzdbh,
                            'slh': task.slh,
                            'rwh': task.rwh,
                            'hjh': task.hjh,
                            'dqbm': $appConfig.userInfo.DQBM
                        }
                    })
                }).then(function (data) {
                    taskService._broadTaskChange();
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 退签工单
             * @param task
             * @returns {Promise}
             */
            tqTask: function (task) {
                var deferred = $q.defer();
                var time = $hyDateLocale.formatDate(new Date(), "YYYY-MM-DD hh:mm:ss");
                $hyHttp.appPost('webService', {
                    'serverName': 'ToGzdqxqs',
                    'rc_head': 'ToGzdqxqsRequest',
                    'rc_body': JSON.stringify({
                        'ToGzdqxqs_IN': {
                            'CZRBS': $appConfig.userInfo.RYBS,
                            'GZDBH': task.gzdbh,
                            'CZSJ': time,
                            'RWH': task.rwh,
                            'GZDHJH': task.hjh,
                            'DQBM': $appConfig.userInfo.DQBM,
                            'GDDWBM': $appConfig.userInfo.GDDWBM
                        }
                    })
                }).then(function (data) {
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 获取工作单的办理进度情况
             * @param task
             * @returns {promise|*}
             */
            getTaskStateList: function (task) {
                var deferred = $q.defer();
                //修改用地市帐号登录，不能查看省客服工作单号详情的错误
                var dqbm = $appConfig.userInfo.DQBM;
                if (task.ywzldm == 'F-CSG-MK0623-01-03') {
                    dqbm = dqbm.substring(0, 2) + '0000';
                }
                $hyHttp.appPost('webService', {
                    'serverName': 'QueryJobOrderProcessing',
                    'rc_head': 'QueryJobOrderProcessingRequest',
                    'rc_body': JSON.stringify({
                        'QueryJobOrderProcessing_In': {
                            'czrbs': $appConfig.userInfo.RYBS,
                            'gzdbh': task.gzdbh,
                            'slh': task.slh ? '' : task.slh,
                            'rwh': task.rwh ? '' : task.rwh,
                            'hjh': task.hjh ? '' : task.hjh,
                            'dqbm': dqbm
                        }
                    })
                }).then(function (data) {
                    var res = [];
                    if (data && data.QueryJobOrderProcessing_Out) {
                        //由于营销系统中的接口如果数据是一条返回的是object，所以需要进行数组转换
                        var taskState = $hyUtil.convertToArray(data.QueryJobOrderProcessing_Out);
                        // 按时间倒序排序
                        res = taskState.sort(function (obj1, obj2) {
                            if (obj1.chsj < obj2.chsj) {
                                return 1;
                            } else if (obj1.chsj === obj2.chsj) {
                                return 0;
                            } else {
                                return -1;
                            }
                        })
                    }
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 获取传递工作单的参数对象
             * @param task
             * @param type
             * @param dlzh
             * @param hjh
             * @returns {{serverName: string, rc_head: string, rc_body: string}}
             * @private
             */
            _getTaskSendArgs: function (task, type, dlzh, hjh) {
                if (!dlzh) {
                    dlzh = $appConfig.getUserInfo().DLZH;
                }
                if (!hjh) {
                    hjh = task.hjh;
                }
                var dateString = $hyDateLocale.formatDate(new Date(), "YYYY-MM-DD hh:mm:ss");
                var params = {
                    serverName: 'changeProcess',
                    rc_head: 'changeProcessRequest',
                    rc_body: JSON.stringify({
                        processInfo: {
                            taskID: task.gzdbh + '+' + hjh,
                            appNo: task.gzdbh,
                            operateType: type,
                            operateTime: dateString,
                            operateMan: dlzh,
                            remark: ''
                        }
                    })
                };
                return params;
            },
            /**
             * 根据菜单和工单进行缓存工单列表的处理
             * 并发送广播通知监听的控制器重新获取列表数据
             */
            _changeTaskList: function (task) {
                this._broadTaskChange();
            },
            /**
             * 澳电传递工作单
             * @param task
             * @param type
             * @param dlzh
             * @param hjh
             * @returns {*}
             */
            passGzd: function (task) {
                var inparam = {
                    "operatorid": $appConfig.getUserInfo().RYBS,
                    "wkflowinstno": task.wkflowinstno,
                    "wkflowtaskno": task.wkflowtaskno,
                    "wkordrno": task.wkordrno
                };
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_WO_URL,
                    serviceName: 'commitWorkOrderTaskService'
                };
                $hyHttp.appPost(serviceUrl, inparam).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 澳电选择人员传递工作单
             * @param task
             * @param type
             * @param dlzh
             * @param hjh
             * @returns {*}
             */
            passPgGzd: function (task) {
                var dqclr = $appConfig.getUserInfo().RYBS + "";
                var inparam = {
                    "handlerList": [dqclr],
                    "operatorid": dqclr,
                    "wkflowinstno": task.wkflowinstno,
                    "wkflowtaskno": task.wkflowtaskno,
                    "wkordrno": task.wkordrno
                };
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_WO_URL,
                    serviceName: 'dispatchWorkOrderTaskService'
                };
                $hyHttp.appPost(serviceUrl, inparam).then(function (res) {
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 传递工作单
             * @param task
             * @param type
             * @param dlzh
             * @param hjh
             * @returns {*}
             */
            send: function (task, type, dlzh, hjh) {
                var self = this;
                var deferred = $q.defer();
                var _args = this._getTaskSendArgs(task, type, dlzh, hjh);
                $hyHttp.appPost('webService', _args)
                    .then(function (data) {
                        if (data && (data.replyCode === '操作成功！' || data.replyCode === 'OK')) {
                            self._changeTaskList(task);
                            deferred.resolve();
                        } else {
                            $hyHttp.rejectError(deferred, data.replyCode);
                        }
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /**
             * 获取上传附件的其他上传参数
             * @param file
             * @param task
             * @param serviceName
             * @returns {{rc_head: string, serverName: (*|string), rc_body, fileNum: number, ftpdir: (*|string), rc_requestUrl: (*|string), fileFrontStr: (*|string)}}
             * @private
             */
            _getFileUploadParam: function (fileList, task, serviceName) {
                serviceName = serviceName || 'UploadMobileClientAttachment';
                var rcBody = [];
                for (var i = 0; i < fileList.length; i++) {
                    if (serviceName == 'HandSign' && i > 0) continue;
                    var file = fileList[i];
                    if (!file.FJFZBS || file.FJFZBS == '-1') {
                        file.FJFZBS = this.getTaskFjfzbs(task);
                    }
                    var item = {
                        GZDBH: file.GZDBH,  //工作单编号
                        RWBS: file.RWH,  //任务号
                        HJH: file.HJH, //环节号
                        FJFZBS: file.FJFZBS,  //图片文件路径
                        YWLX: file.YWLX,  //类型
                        YWCLR: file.YWCLR,  //上传人登录账号
                        BZ: file.BZ,  //备注
                        YHBH: file.YHBH,
                        MBH: file.MBH,  //模板号
                        uploadFilePath: file.ISSTREAM == '0' ? file.SRC : new Date().getTime()
                    };
                    item.TEMPLATE = '0';
                    if (task && task.YWCJ) {
                        item.YWCJ = task.YWCJ;
                    }
                    if (task && task.YWSJ) {
                        item.YWSJ = task.YWSJ;
                    }
                    if (task && task.TEMPLATE) {
                        item.TEMPLATE = task.TEMPLATE;
                    }
                    rcBody.push(item);
                }

                var param = {
                    rc_head: 'uploadMobileClientAttachmentRequest',
                    serverName: serviceName,
                    rc_body: {MobileClientAttachmentInType: rcBody},
                    fileNum: 1,
                    ftpdir: file.YWCLR || 'ynydyx',
                    rc_requestUrl: task.fileFrontStr || '',
                    fileFrontStr: task.fileFrontStr || ''
                };
                return param;
            },
            /**
             * 获取上传地址
             * @param fileList
             * @param task
             * @param serviceName
             * @returns {string}
             * @private
             */
            _getUploadUrl: function (fileList, task, serviceName) {
                var args = this._getFileUploadParam(fileList, task, serviceName);
                var uploadFileUrl = '';
                var param = encodeURIComponent(JSON.stringify(args));
                if (FILE_UPLOAD_URL.indexOf('?') >= 0) {
                    uploadFileUrl = FILE_UPLOAD_URL + "&json_params=" + param;
                } else {
                    uploadFileUrl = FILE_UPLOAD_URL + "?json_params=" + param;
                }
                return uploadFileUrl;
            },
            /**
             * 批量上传意见反馈的服务新
             * @param url 上传地址
             * @param fileList base64编码的文件流数组
             */
            uploadFileListNew: function (url, fileList) {
                var jbxx = {
                    'gzdbh': fileList[0].GZDBH ? fileList[0].GZDBH : '',
                    'rwh': fileList[0].RWH ? fileList[0].RWH : '',
                    'module': fileList[0].YWLX ? fileList[0].YWLX : ''
                };
                var fileInfo = {
                    "module": jbxx.module + "+" + $appConfig.userInfo.RYBS,
                    "businessNo": jbxx.gzdbh,
                    "tacheNo": jbxx.rwh,
                    "files": []
                };
                var deferred = $q.defer();
                var condition = {
                    orderLen: fileList.length,
                    successDown: 0,
                    failDown: 0
                };
                for (var i = 0; i < fileList.length; i++) {
                    var fileStreams = [];
                    var key = fileList[i].key;
                    var stream = fileList[i].stream;
                    stream = stream.replace(/data:.*;base64,/g, '');
                    var data = {'fileName': key, 'inputString': stream};
                    fileStreams.push(data);
                    fileInfo.files = JSON.stringify(fileStreams);
                    var inparam = {"paramMap": fileInfo};
                    var serviceUrl = {
                        url: TFConstant.KF_FRAME_URL,
                        serviceName: 'sysAttach/uploadBase64Muti'
                    };
                    (function (i) {
                        $hyHttp.appPost(serviceUrl, inparam).then(function (res) {
                            // 成功数量加1
                            if (res instanceof Array && res.length > 0) {
                                condition.successDown++;
                                fileList[i].uploadSuccess = true;
                                fileList[i].fileId = res[0].fileId;
                            } else {
                                condition.failDown++;
                                fileList[i].uploadSuccess = false;
                            }
                            if (condition.successDown + condition.failDown === condition.orderLen) {
                                if (condition.failDown > 0) {
                                    deferred.reject();
                                } else {
                                    // 所有照片均上传成功
                                    deferred.resolve(res);
                                }
                            }
                        }, function (error) {
                            condition.failDown++;
                            fileList[i].uploadSuccess = false;
                            if (condition.successDown + condition.failDown === condition.orderLen) {
                                if (condition.failDown > 0) {
                                    deferred.reject(error);
                                }
                            }
                        });
                    })(i);

                }
                return deferred.promise;
                // var fileStreams = [];
                // for (var i = 0; i < fileList.length; i++) {
                //     var key = fileList[i].key;
                //     var stream = fileList[i].stream;
                //     stream = stream.replace(/data:.*;base64,/g, '');
                //     var data = {'fileName': key, 'inputString': stream};
                //     fileStreams.push(data);
                // }
                // fileInfo.files = JSON.stringify(fileStreams);
                // var inparam = {"paramMap": fileInfo};
                //
                // var deferred = $q.defer();
                // var serviceUrl = {
                //     url: TFConstant.KF_FRAME_URL,
                //     serviceName: 'sysAttach/uploadBase64Muti'
                // };
                // $hyHttp.appPost(serviceUrl, inparam).then(function (res) {
                //     deferred.resolve(res);
                // }, function (error) {
                //     deferred.reject(error);
                // });
                // return deferred.promise;

                // return $http({
                //     method: 'POST',
                //     url: url,
                //     data: JSON.stringify(inparam),
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     transformRequest: angular.identity
                // });
            },
            /**
             * 批量上传文件
             * @param list
             * @param task
             * @param serviceName
             * @returns {*}
             */
            uploadFileByList: function (list, task, serviceName) {
                var self = this;
                var deferred = $q.defer();
                var uploadFileUrl = TFConstant.KF_FRAME_URL;
                serviceName = serviceName || 'sysAttach/uploadBase64Muti';
                uploadFileUrl = encodeURI(uploadFileUrl + serviceName);
                if (!list || list.length <= 0) {//没有文件上传
                    deferred.resolve({code: 0, content: []});
                    return deferred.promise;
                }
                this.getFileListBase64(list).then(function (fileList) {
                    if (fileList.length <= 0) {
                        deferred.reject({message: '读取本地文件失败！'});
                        return;
                    }
                    self.uploadFileListNew(uploadFileUrl, fileList)
                        .then(function (res) {
                            list.forEach(function (item) {
                                for (var i = 0; i < fileList.length; i++) {
                                    if (fileList[i].key == item.KEY) {
                                        item.MBH = fileList[i].fileId//借用MBH字段缓存fileId
                                    }
                                }
                                item.ISUPLOAD = '1';
                            });
                            persistence.flush(function () {
                                deferred.resolve(res);
                            });
                        }, function (error) {
                            deferred.reject(error);
                        });
                    // self.uploadFileListNew(uploadFileUrl, fileList)
                    //     .success(function (res) {
                    //         list.forEach(function (item) {
                    //             if(res && res instanceof Array && res.length>0){
                    //                 for(var i = 0;i<res.length;i++){
                    //                     if(res[i].fileName == item.KEY){
                    //                         item.MBH = res[i].fileId//借用MBH字段缓存fileId
                    //                     }
                    //                 }
                    //             }
                    //             item.ISUPLOAD = '1';
                    //         });
                    //         persistence.flush(function () {
                    //             deferred.resolve(res);
                    //         });
                    //     })
                    //     .error(function (error) {
                    //         deferred.reject(error);
                    //     });
                });
                return deferred.promise;
            },
            /**
             * 本地文件转BASE64流字符串数组
             * @param src
             * @returns {string}
             */
            getFileListBase64: function (list) {
                var deferred = $q.defer();
                var fileList = [];
                var self = this;
                var _getStreamBase64 = function (index) {
                    index = index || 0;
                    if (list.length <= index) {
                        deferred.resolve(fileList);
                        return;
                    }
                    var file = list[index];
                    var stream = file.SRC;
                    var time = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') || '';
                    var timeStr = time.replace(/[^0-9]/ig, "");
                    var key = file.KEY && file.KEY.length > 0 ? file.KEY : "Pic" + timeStr + '_' + (index + 1) + ".png";
                    if (file.ISSTREAM == '1') {
                        file.key = key;
                        fileList.push({
                            key: key,
                            stream: stream,
                            GZDBH: file.GZDBH,
                            RWH: file.RWH,
                            YWLX: file.YWLX
                        });
                        index++;
                        _getStreamBase64(index);
                    } else {
                        self.getFileBase64Canvas(file.SRC).then(function (str, res) {
                            file.key = key;
                            fileList.push({
                                key: key,
                                stream: str,
                                GZDBH: file.GZDBH,
                                RWH: file.RWH,
                                YWLX: file.YWLX
                            });
                            index++;
                            _getStreamBase64(index);
                        }, function () {
                            index++;
                            _getStreamBase64(index);
                        });
                    }

                };

                _getStreamBase64();

                return deferred.promise;
            },
            /**
             * 本地文件转BASE64流字符串
             * cordova插件
             * @param src
             * @returns {string}
             */
            getFileBase64: function (src) {
                var deferred = $q.defer();
                var stream = '';

                //读取流文件
                var readDataUrl = function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        stream = evt.target.result;
                        deferred.resolve(stream, evt);
                    };
                    reader.readAsDataURL(file);
                };
                //失败回调
                var fail = function () {
                    deferred.reject(arguments);
                };
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                    function (fileSystem) {
                        fileSystem.root.getFile(src, null,
                            function (fileEntry) {
                                fileEntry.file(readDataUrl, fail);
                            },
                            fail);
                    }, fail);

                return deferred.promise;
            },
            /**
             * 本地文件转BASE64流字符串
             * 通过画布
             * @param src
             * @returns {string}
             */
            getFileBase64Canvas: function (src) {
                var deferred = $q.defer();
                var stream = '';
                var canvas = angular.element('<canvas></canvas>');
                var img = new Image();
                img.src = src;
                img.onload = function () {
                    canvas.attr({
                        width: img.width,
                        height: img.height
                    });
                    var ctx = canvas[0].getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    stream = canvas[0].toDataURL('image/png', 1);
                    deferred.resolve(stream);
                };

                return deferred.promise;
            },
            /**
             * 打开相机
             */
            chooseCamera: function (callback, errorBack) {
                var quality = this._getQuality();
                var errorFun = function (code, message) {
                    if (errorBack && angular.isFunction(errorBack)) {
                        errorBack.call(this, {
                            code: code,
                            message: message
                        });
                    }
                };
                if (!navigator.camera) {
                    errorFun.call(this, -1, '没有找到调用相机设备的API');
                    return;
                }
                navigator.camera.getPicture(function (path) {
                    if (callback && angular.isFunction(callback)) {
                        callback.call(this, path);
                    }
                }, function () {
                    errorFun.call(this, -1, '调用相机设备出错');
                }, {
                    quality: quality.quality,
                    allowEdit: false,
                    targetHeight: quality.targetHeight,
                    targetWidth: quality.targetWidth,
                    destinationType: Camera.DestinationType.FILE_URI,
                    cameraDirection: Camera.Direction.BACK
                });
            },
            /**
             * 打开图库
             */
            chooseImage: function (callback, errorBack) {
                var quality = this._getQuality();
                var errorFun = function (code, message) {
                    if (errorBack && angular.isFunction(errorBack)) {
                        errorBack.call(this, {
                            code: code,
                            message: message
                        });
                    }
                };
                if (!navigator.camera) {
                    errorFun.call(this, -1, '没有找到调用相机设备的API');
                    return;
                }
                navigator.camera.getPicture(function (path) {
                    if (callback && angular.isFunction(callback)) {
                        callback.call(this, path);
                    }
                }, function () {
                    errorFun.call(this, -1, '调用相机设备出错');
                }, {
                    quality: quality.quality,
                    allowEdit: false,
                    targetHeight: quality.targetHeight,
                    targetWidth: quality.targetWidth,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                });
            },
            _getQuality: function () {
                var quality = {quality: 80, targetHeight: 1500, targetWidth: 1500};
                var qualityKey = 'UPLOAD_PHOTO_QUALITY';
                var qualityvalue = $hyUtil.getLocal(qualityKey) || 1;
                if (qualityvalue === 1) {
                    quality = {quality: 50, targetHeight: 1000, targetWidth: 1000};
                } else if (qualityvalue === 2) {
                    quality = {quality: 80, targetHeight: 1500, targetWidth: 1500};
                } else if (qualityvalue === 3) {
                    quality = {quality: 100, targetHeight: 2000, targetWidth: 2000};
                }
                return quality;
            },
            /**
             * 获取工单附件
             * @param task {
             * gzdbh:工作单编号
             * rwh:任务号
             * hjh:环节号 getFileByTask
             * }
             */
            getFileByTask: function (task) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                var gzdbh = task.gzdbh;
                var hjh = task.hjh;
                var files = PHOTO_FILE_INFO.all();
                files = files.filter('ENABLED', '=', '1');
                if (gzdbh && gzdbh.length > 0) {
                    files = files.filter('GZDBH', '=', gzdbh)
                        .filter('HJH', '=', hjh);
                    //.filter('RWH', '=', rwh)
                }
                if (arguments && arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        var param = arguments[i];
                        if (!param) continue;
                        files = files.filter(param.key, param.operate || '=', param.value);
                    }
                }
                files.list(null, function (results) {
                    deferred.resolve(results);
                });
                return promise;

            },
            /**
             * 选择附件上传
             * @param task{
             *  GZDBH       : 'TEXT',  //工作单编号
             *  RWH         : 'TEXT',  //任务号
             *  HJH         : 'TEXT',  //环节号
             *  YWLX        : 'TEXT',  //类型
             *  YWCLR       : 'TEXT',  //上传人登录账号
             *  BZ          : 'TEXT',  //备注
             *  MBH         : 'TEXT',  //模板号
             *  MBBBH       : 'TEXT',  //模板版本号
             *  YHBH        : 'TEXT'  //用户编号
             * }
             * @param options{
             *  message :选择提示
             *  success:成功回调
             *  error:失败回调selectFile({})
             * }
             */
            selectFile: function (task, options) {
                options = options || {};
                var self = this;
                hyMui.confirm({
                    message: options.message || '選擇附件來源',
                    buttonLabels: ['圖庫', '相機'],
                    cancelable: true,
                    callback: function (index) {
                        if (index != 1 && index != 0) return;
                        if (index == 1) {
                            self.chooseCamera(function (src) {
                                self._selectSuccess(src, task).then(function (file) {
                                    if (options.success && angular.isFunction(options.success))
                                        options.success.call(self, file);
                                });
                            }, options.error);
                            return;
                        }

                        /*self.chooseImage(function (src) {
                            self._selectSuccess(src, task).then(function (file) {
                                if (options.success && angular.isFunction(options.success))
                                    options.success.call(self, file);
                            });
                        }, options.error);*/

                        self.chooseMroImage(function (medias) {
                            for (var i = 0; i < medias.length; i++) {
                                // if(resultMedias[i].size>1048576){ resultMedias[i].quality=50; } else {d ataArray[i].quality=100;}
                                (function (i) {
                                    medias[i].quality = 40; // when the value is 100,return original image
                                    medias[i].thumbnailQuality = 50; // 缩图质量（默认值）
                                    medias[i].thumbnailW = 200; // 缩图宽（默认值）
                                    medias[i].thumbnailH = 200; // 缩图高（默认值）
                                    medias[i].maxWidth = 640; //
                                    medias[i].maxHeight = 480; //
                                    MediaPicker.compressImage(medias[i], function (compressData) {
                                        // user compressData.path upload compress img
                                        // medias[i].path = compressData.path;
                                        self._selectSuccess(compressData.uri, task).then(function (file) {
                                            if (options.success && angular.isFunction(options.success))
                                                options.success.call(self, file);
                                        });
                                    }, function (e) {
                                        console.log(e)
                                    });
                                })(i);
                            }
                        }, options.error);
                    }
                });
            },
            /**
             * 选择多张照片
             * @param callback
             * @param errorBack
             */
            chooseMroImage: function (callback, errorBack) {
                var errorFun = function (code, message) {
                    if (errorBack && angular.isFunction(errorBack)) {
                        errorBack.call(this, {
                            code: code,
                            message: message
                        });
                    }
                };
                if (!window.MediaPicker) {
                    errorFun.call(this, -1, '没有找到调用相冊的API');
                    return;
                }
                var args = {
                    'selectMode': 101, //101=picker image and video , 100=image , 102=video
                    'maxSelectCount': 6, //default 40 (Optional)
                    'maxSelectSize': 188743680, //188743680=180M (Optional)
                    'thumbnailQuality': 50,
                    'thumbnailW': 200,
                    'thumbnailH': 200,
                    'quality': 40,
                    'maxWidth': 640,
                    'maxHeight': 480
                };
                MediaPicker.getMedias(args, function (medias) {
                    //medias [{mediaType: "image", path:'/storage/emulated/0/DCIM/Camera/20170808_145202.jpg', size: 21993}]
                    if (callback && angular.isFunction(callback)) {
                        callback.call(this, medias);
                    }
                }, function () {
                    errorFun.call(this, -1, '调用相冊出错');
                })
            },
            /**
             * 保存工单附件分组标示
             */
            saveTaskFjfzbs: function (task, fjfzbs) {
                var key = '';
                var gzdbh = task.gzdbh || '';
                var hjh = task.hjh || '';
                var onlyBs = task.onlybs || '';
                key = gzdbh + '_' + hjh + '_' + onlyBs;
                $hyUtil.saveLocal('GD_FJFZBS_' + key, {bs: fjfzbs});
            },
            /**
             * 获取任务的附件分组标示
             * @param task
             * @returns {*}
             * @private
             */
            getTaskFjfzbs: function (task) {
                var fjfzbs = task.fjfzbs;
                var key = '';
                var gzdbh = task.gzdbh || '';
                var hjh = task.hjh || '';
                var onlyBs = task.onlybs || '';
                key = gzdbh + '_' + hjh + '_' + onlyBs;
                if (!fjfzbs || fjfzbs == '-1') {
                    var cacheBs = $hyUtil.getLocal('GD_FJFZBS_' + key, task) || {};
                    fjfzbs = cacheBs.bs || '-1';
                }
                return fjfzbs;
            },
            /**
             * 图片选择成功操作
             * @private
             */
            _selectSuccess: function (src, task) {
                return this.saveFileLocal(src, task);
            },
            /**
             * 添加图片到数据库
             * @private
             */
            saveFileLocal: function (src, task) {
                var deferred = $q.defer();
                var onlyBs = task.ONLYBS || '';
                var file = new PHOTO_FILE_INFO({
                    GZDBH: task.GZDBH,  //工作单编号
                    RWH: task.RWH,  //任务号
                    HJH: task.HJH, //环节号
                    SRC: src, //图片文件路径
                    //FJFZBS:task.FJFZBS,  //图片文件路径
                    YWLX: task.YWLX,  //类型
                    YWCLR: task.YWCLR,  //上传人登录账号
                    BZ: task.BZ,  //备注
                    MBH: task.MBH,  //模板号
                    MBBBH: task.MBBBH,  //模板版本号
                    YHBH: $filter('date')(new Date(), 'yyyy-MM-dd'),  //用户编号(借用当做存储时间)
                    ENABLED: '1',
                    ISUPLOAD: '0',
                    ISSTREAM: task.ISSTREAM || '0',
                    ONLYBS: onlyBs,
                    KEY: task.KEY
                });

                var fjfzbs = this.getTaskFjfzbs({
                    gzdbh: task.GZDBH,
                    rwh: task.RWH,  //任务号
                    hjh: task.HJH, //环节号
                    fjfzbs: task.FJFZBS,
                    onlybs: onlyBs
                });
                file.FJFZBS = fjfzbs;
                persistence.add(file);
                persistence.flush(function () {
                    deferred.resolve(file);
                });
                return deferred.promise;
            },
            /**
             * 上传附件
             * @param task
             * @param fileList{gzdbh:onlybs}
             */
            uploadFileByTask: function (task, serviceName) {
                var self = this;
                var onlyBs = task.onlybs;
                var args = [];
                args.push(task);
                args.push({key: 'ISUPLOAD', value: '0'});
                if (onlyBs) args.push({key: 'ONLYBS', value: onlyBs});
                if (arguments.length > 2) {
                    Array.prototype.push.apply(args, Array.prototype.slice.call(arguments, 2));
                }

                return self.getFileByTask.apply(self, args).then(function (list) {
                    return self.uploadFileByList(list, task, serviceName);
                });
            },
            /**
             * 更新附件分组标示
             * @param fjfzbs
             * @param task
             */
            updateFileFjfzbs: function (fjfzbs, task) {
                return this.updateTaskFile({FJFZBS: fjfzbs}, task);
            },
            /**
             * 更新任务文件
             * @param file键值对要更新数据
             * @param task
             */
            updateTaskFile: function (file, task) {
                var deferred = $q.defer();
                this.getFileByTask.apply(this, Array.prototype.slice.call(arguments, 1)).then(
                    function (list) {
                        list.forEach(function (item) {
                            for (var key in file) {
                                item[key] = file[key];
                            }
                        });
                        persistence.flush(function () {
                            deferred.resolve(list);
                        });
                    }
                );
                return deferred.promise;
            },
            /**
             * 删除文件
             * @param file
             * @returns {*}
             */
            deleteFile: function (file) {
                var deferred = $q.defer();
                if (!file) {
                    deferred.resolve(file);
                    return deferred.promise;
                }
                if (file.ISUPLOAD == '0') {//未上传的图片，删除
                    persistence.remove(file);
                } else {//标记删除
                    file.ENABLED = '0';
                }

                persistence.flush(function () {
                    deferred.resolve(file);
                });
                return deferred.promise;
            },
            /**
             * 下载并更新到当前数据库
             * @param file
             */
            downloadFilePer: function (serviceName, file, options, downData) {
                var deferred = $q.defer();
                downData = downData || '';
                if (!file) {
                    deferred.reject(file);
                    return deferred.promise;
                }
                var self = this;
                var fileName = file.fileName;
                file.enabled = '1';
                file.percent = 0;
                file.total = 0;
                file.loaded = 0;
                persistence.add(file);
                persistence.flush(null, function () {
                    self.downloadFile(serviceName, options, fileName, downData).then(function (entry) {
                        file.fileName = entry.name;
                        file.time = new Date().getTime();
                        file.url = entry.nativeURL;
                        persistence.flush(null, function () {
                            deferred.resolve(file);
                        });
                    }, function (error) {
                        file.enabled = '0';
                        persistence.flush(null, function () {
                            deferred.reject(file, error, '下载失败！');
                        });
                    }, function (data) {
                        // 设置下载进度
                        var percent = Math.ceil((data.loaded / data.total) * 100);
                        file.percent = percent;
                        file.total = data.total;
                        file.loaded = data.loaded;
                        persistence.flush(null, function () {
                            deferred.notify(file, percent);
                        });
                    });
                });
                return deferred.promise;
            },

            /**
             * 下载文件
             * @param params
             */
            downloadFile: function (serviceName, options, fileName, downData) {
                var deferred = $q.defer();
                if (!window.FileTransfer) {
                    deferred.reject({code: -1}, '非移动设备！');
                    return deferred.promise;
                }
                var fileTransfer = new window.FileTransfer();

                if (!fileName) {
                    fileName = new Date().getTime();
                }
                var fileUrl = cordova.file.externalDataDirectory;
                if ($hyUtil.isIOS()) {
                    fileUrl = cordova.file.tempDirectory;
                }
                fileUrl += fileName;
                //传输进度
                fileTransfer.onprogress = function (event) {
                    deferred.notify(event, fileName);
                }.bind(this);
                options = options || [];
                var url = '';
                if (downData) {
                    if (connectionType == 2) {//鏈接esb
                        url = $appConfig.appUrl + "/file/download/" + downData;
                    } else {
                        url = "http://172.20.195.210:8888/ccsmobile/file/download/" + downData;
                    }
                    url = encodeURI(url);
                    fileTransfer.download(url, fileUrl, function (entry) {
                        deferred.resolve(entry);
                    }, function (error) {
                        deferred.reject(error, '下载失败！');
                    }, false, {
                        headers: {
                            Authorization: "Bearer " + appUserInfo.token
                        }
                    });
                } else {
                    deferred.reject();
                }

                return deferred.promise;
            },
            /**
             * 打开文件
             */
            openLoadFile: function (fileUrl, contentType) {
                var deferred = $q.defer();
                if (!window.cordova.plugins.fileOpener2) {
                    deferred.reject({code: -1}, '非移动设备！');
                    return deferred.promise;
                }
                var callback = {
                    success: function () {
                        deferred.resolve();
                    },
                    error: function (err) {
                        deferred.reject(err, '打开文件失败！');
                    }
                };

                contentType = this.getOpenFileType(fileUrl, contentType);
                window.cordova.plugins.fileOpener2.open(fileUrl, contentType, callback);
                return deferred.promise;
            },

            getOpenFileType: function (fileName, contentType) {
                fileName = fileName || '';
                var type = contentType || 'text/plain';//（纯文本）
                var kzm = fileName.substring(fileName.lastIndexOf('.') + 1);
                kzm = kzm.toLowerCase();
                switch (kzm) {
                    case 'html':
                        type = 'application/xhtml+xml';//（XHTML文档）
                        break;
                    case 'xhtml':
                        type = 'application/xhtml+xml';//（XHTML文档）
                        break;
                    case 'htm':
                        type = 'application/xhtml+xml';//（XHTML文档）
                        break;
                    case 'xml':
                        type = 'application/xhtml+xml';//（XHTML文档）
                        break;
                    case 'gif':
                        type = 'image/gif';//（GIF图像）
                        break;
                    case 'jpeg':
                        type = 'image/jpeg';//（JPEG图像）
                        break;
                    case 'jpg':
                        type = 'image/jpeg';//（GIF图像）
                        break;
                    case 'png':
                        type = 'image/png';//（PNG图像）
                        break;
                    case 'mp3':
                        type = 'video/mpeg';//（MPEG动画）
                        break;
                    case 'mp4':
                        type = 'video/mpeg';//（MPEG动画）
                        break;
                    case 'rmvb':
                        type = 'video/mpeg';//（MPEG动画）
                        break;
                    case 'pdf':
                        type = 'application/pdf';//（PDF文档）
                        break;
                    case 'doc':
                        type = 'application/msword';//（Microsoft Word文件）
                        break;
                    case 'docx':
                        type = 'application/msword';//（Microsoft Word文件）
                        break;
                    default:
                        type = contentType || 'text/plain';//（纯文本）
                        break;
                }
                //application/octet-stream（任意的二进制数据）
                //application/msword（Microsoft Word文件）
                //message/rfc822（RFC 822形式）
                //multipart/alternative（HTML邮件的HTML形式和纯文本形式，相同内容使用不同形式表示）
                //application/x-www-form-urlencoded（使用HTTP的POST方法提交的表单）
                //multipart/form-data（同上，但主要用于表单提交时伴随文件上传的场合）
                return type;
            },
            /**
             * 上传意见反馈功能新
             * @param ONLYBS 唯一标识
             * @param serviceName 服务名（可空）
             * @param fxxdbId
             * @returns {Promise}
             */
            uploadYjfkPicNew: function (ONLYBS, serviceName, fxxdbId) {
                var deferred = $q.defer();
                var uploadFileUrl = TFConstant.KF_FRAME_URL;
                serviceName = serviceName || 'sysAttach/uploadBase64Muti';
                uploadFileUrl = encodeURI(uploadFileUrl + serviceName);
                var files = PHOTO_FILE_INFO.all();
                files = files.filter('ENABLED', '=', '1');
                files = files.filter('ONLYBS', '=', ONLYBS);
                files = files.filter('ISUPLOAD', '=', '0');
                var self = this;
                files.list(null, function (results) {
                    if (!results || results.length === 0) {
                        deferred.resolve({code: 0, content: []});
                        return deferred.promise;
                    }

                    self.getFileListBase64(results).then(function (fileList) {
                        if (fileList.length <= 0) {
                            deferred.reject({message: '读取本地文件失败！'});
                            return;
                        }
                        self.uploadFileListNew(uploadFileUrl, fileList)
                            .then(function (res) {
                                results.forEach(function (item) {
                                    for (var i = 0; i < fileList.length; i++) {
                                        if (item.key === fileList[i].key) {
                                            if (fileList[i].uploadSuccess) {
                                                item.ISUPLOAD = '1';
                                                break;
                                            }
                                        }
                                    }
                                });
                                persistence.flush(function () {
                                    deferred.resolve(res);
                                });
                            }, function (error) {
                                results.forEach(function (item) {
                                    for (var i = 0; i < fileList.length; i++) {
                                        if (item.key === fileList[i].key) {
                                            if (fileList[i].uploadSuccess) {
                                                item.ISUPLOAD = '1';
                                                break;
                                            }
                                        }
                                    }
                                });
                                persistence.flush(function () {
                                    deferred.reject(error);
                                });
                            });
                        // self.uploadFileListNew(uploadFileUrl, fileList)
                        //     .success(function (res) {
                        //         results.forEach(function (item) {
                        //             item.ISUPLOAD = '1';
                        //         });
                        //         persistence.flush(function () {
                        //             deferred.resolve(res);
                        //         });
                        //     })
                        //     .error(function (error) {
                        //         deferred.reject(error);
                        //     });
                    });
                });
                return deferred.promise;
            },
            /**
             * 判断电子签名是否上传记录
             * @param param
             * @returns {Promise}
             * @constructor
             */
            HandSignAgain: function (param) {
                var deferred = $q.defer();
                $hyHttp.appPost('cxdzqmService', {
                    'json_params': JSON.stringify({
                        'GZDBH': param.gzdbh,
                        'HJH': param.hjh,
                        'CJBH': param.cjbh
                    })
                }).then(function (data) {
                    var res = [];
                    if (data && data.requestResult && data.requestResult.content) {
                        res = data.requestResult.content;
                    }
                    deferred.resolve(res);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 查询图片，返回base64
             */
            queryImgBase64: function (params) {
                var deferred = $q.defer();
                var serviceUrl = {
                    url: TFConstant.KF_FRAME_URL,
                    serviceName: 'sysAttach/download'
                };
                $hyHttp.appPost(serviceUrl, params).then(function (res) {
                    if (res.paramMap) {
                        var index = res.paramMap.fileName && res.paramMap.fileName.lastIndexOf('.');
                        var suffix = index > 0 ? res.paramMap.fileName.substring(index + 1).toLocaleLowerCase() : '';
                        var base64Str = (suffix === 'jpg' || suffix === 'jpeg' || suffix === 'png') ? 'data:image/' + suffix + ';base64,' + res.paramMap.osString : null;
                        var result = {
                            fileName: res.paramMap.fileName,
                            osString: base64Str
                        };
                        deferred.resolve(result);
                    }
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 获取目录
             */
            getLocalDocumentEntry: function () {
                var deferred = $q.defer();
                if (!window.resolveLocalFileSystemURL) {
                    deferred.reject({code: -1, message: '非移動設備'}, '非移动设备！');
                    return deferred.promise;
                }
                var fileUrl = cordova.file.externalDataDirectory;
                if ($hyUtil.isIOS()) {
                    fileUrl = cordova.file.tempDirectory;
                }
                window.resolveLocalFileSystemURL(fileUrl, function (dirEntry) {
                    deferred.resolve(dirEntry);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            /**
             * 获取文件
             * @param fileName 在本地生成的文件名称
             * @returns {*}
             */
            getPrjectFile: function (fileName) {
                var deferred = $q.defer();
                var self = this;
                self.getLocalDocumentEntry().then(function (dirEntry) {
                    dirEntry.getFile(fileName, {create: true, exclusive: false},
                        function (fileEntry) {
                            deferred.resolve(fileEntry);
                        });
                }, function (code) {
                    deferred.reject(code);
                });
                return deferred.promise;
            },
            /**
             * 写入文件
             * @param blob 写入数据-Blob对象
             * @param fileName 在本地生成的文件名称
             * @returns {*}
             */
            writeFile: function (blob, fileName) {
                var deferred = $q.defer();
                if (!blob instanceof Blob) {
                    deferred.resolve({code: '0', message: '格式錯誤'});
                    return;
                }
                var self = this;
                self.getPrjectFile(fileName).then(function (fileEntry) {
                    //创建一个写入对象
                    fileEntry.createWriter(function (fileWriter) {
                        //文件写入成功
                        fileWriter.onwriteend = function () {
                            deferred.resolve({code: '1', message: '導出成功'});
                        };
                        //文件写入失败
                        fileWriter.onerror = function (e) {
                            deferred.resolve({code: '0', message: '導出失敗'});
                        };
                        //写入文件
                        fileWriter.write(blob);
                    });
                }, function (code) {
                    deferred.reject(code);
                });
                return deferred.promise;
            }
        };
        return taskService;
    }
]);