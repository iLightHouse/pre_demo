cordova.define("hy-cordova-plugins-appupdate.HYAppUpdate", function (require, exports, module) {
	var exec = require('cordova/exec'),
		ProgressEvent = require('cordova-plugin-file.ProgressEvent');

	function newProgressEvent(result) {
		var pe = new ProgressEvent();
		pe.lengthComputable = result.lengthComputable;
		pe.loaded = result.loaded;
		pe.total = result.total;
		return pe;
	}

	var HYAppUpdate = function () {
		this.onprogress = null;
		// optional callback
	};

	/**
	 * 检查更新，返回更新参数对象
	 * @param successCallback
	 * @param errorCallback
	 * @param options
	 */
	HYAppUpdate.prototype.check = function (successCallback, errorCallback, options) {
		var win = function (result) {
			successCallback && successCallback(result);
		};
		var fail = function (result) {
			errorCallback && errorCallback(result);
		};
		exec(win, fail, 'HYAppUpdate', 'check', [options]);
	};

	/**
	 * 执行下载更新
	 * @param successCallback
	 * @param errorCallback
	 * @param options
	 */
	HYAppUpdate.prototype.update = function (successCallback, errorCallback, options) {
		var self = this;
		var win = function (result) {
			if (typeof result.lengthComputable != "undefined") {
				if (self.onprogress) {
					self.onprogress(newProgressEvent(result));
				}
			} else {
				successCallback && successCallback(result);
			}
		};
		var fail = function (result) {
			errorCallback && errorCallback(result);
		};
		exec(win, fail, 'HYAppUpdate', 'update', [options]);
	};

	module.exports = HYAppUpdate;
});
