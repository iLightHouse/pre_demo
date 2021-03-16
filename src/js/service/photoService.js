/**
 * Created by 刘克玉 on 2017/09/13.
 * 保存照片到本地数据库
 */

app.factory('PhotoService', ['$filter', '$q',
    function ($filter, $q) {

        var service = {};

        /**
         * 保存照片-fileId  base64编码
         * @param sysCodeInfo
         * @returns {PromiseLike<any> | Promise | s}
         */
        service.savePhoto = function (sysCodeInfo) {
            var deferred = $q.defer();
            service.getPhoto(sysCodeInfo.fileId).then(function (value) {
                if (value.length === 0) {
                    var sys_drop_code = new CEM_PHOTO_FILE_INFO({
                        FILEID: sysCodeInfo.fileId,
                        BASE: sysCodeInfo.base,
                        YHBH: $filter('date')(new Date(), 'yyyy-MM-dd')
                    });
                    persistence.add(sys_drop_code);
                    persistence.flush(function () {
                        deferred.resolve(sys_drop_code);
                    });
                } else {
                    deferred.resolve(null);
                }
            });
            return deferred.promise;
        };

        /**
         * 获取照片
         * @param fileId
         * @returns {PromiseLike<any> | Promise | s}
         */
        service.getPhoto = function (fileId) {
            fileId = fileId || '';
            var deferred = $q.defer();
            var queryCollection = CEM_PHOTO_FILE_INFO.all().filter('FILEID', '=', fileId);
            queryCollection.list(function (results) {
                var resList = [];
                for (var i = 0; i < results.length; i++) {
                    var obj = {
                        fileId: results[i].FILEID,
                        src: results[i].BASE
                    };
                    resList.push(obj);
                }
                deferred.resolve(resList);
            });
            return deferred.promise;
        };

        /**
         * 删除照片
         * @param fileId
         * @returns {PromiseLike<any> | Promise | s}
         */
        service.delPhoto = function (fileId) {
            var deferred = $q.defer();
            CEM_PHOTO_FILE_INFO.all().filter("FILEID", '=', fileId).list(function (results) {
                results.forEach(function (r) {
                    persistence.remove(r);
                });
                persistence.flush(function () {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        };

        /**
         * 清除相机缓存照片（只保留当天的照片）
         * @param localTime
         * @returns {PromiseLike<any> | Promise | s}
         */
        service.delCameraPhoto = function (localTime) {
            var deferred = $q.defer();
            PHOTO_FILE_INFO.all().filter("YHBH", '!=', localTime).list(function (results) {
                results.forEach(function (r) {
                    persistence.remove(r);
                });
                persistence.flush(function () {
                    deferred.resolve({status: '1'});
                });
            });
            return deferred.promise;
        };

        /**
         * 清除业务缓存图片（只保留当天的图片）
         * @param localTime
         * @returns {PromiseLike<any> | Promise | s}
         */
        service.delCemPhoto = function (localTime) {
            var deferred = $q.defer();
            CEM_PHOTO_FILE_INFO.all().filter("YHBH", '!=', localTime).list(function (results) {
                results.forEach(function (r) {
                    persistence.remove(r);
                });
                persistence.flush(function () {
                    deferred.resolve({status: '1'});
                });
            });
            return deferred.promise;
        };

        return service;
    }
]);
