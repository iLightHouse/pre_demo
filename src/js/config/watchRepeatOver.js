/**
 * Version:1.0.0
 * Author:刘克玉
 * Date:2018/12/25
 * 监听repeat是否加载完成指令
 */
(function () {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }

    module.directive('hyWatchRepeatOver', ['$timeout', '$onsen', function ($timeout, $onsen) {
        return {
            restrict: 'A',
            scope: {
                finishDone:'&hyWatchRepeatOver'
            },
            compile: function () {
                return function (scope) {
                    if (scope.$parent.$last === true) {
                        $timeout(function() {
                            scope.finishDone.call(this);
                        },100);
                    }
                };
            }
        };
    }]);

}());
