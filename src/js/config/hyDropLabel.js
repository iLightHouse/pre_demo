/**
 * Created by keyu on 2017/8/31.
 * 下拉翻译
 */
(function () {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }

    module.directive('hyaDropLable', ['systemDropList', '$onsen', function (systemDropList, $onsen) {
        return {
            restrict: 'A',
            scope: {
                dropCode: '=hyaDropLable',
                dmflCode: '@hyaDropLableDmfl'
            },
            compile: function (element, attrs) {
                return function (scope, element, attrs) {
                    scope.$watch(scope.dropCode, function (value) {
                        changeHtmlVal(value);
                    });

                    function changeHtmlVal(data) {
                        //var data = scope.dropCode;
                        systemDropList.getDropLable(scope.dmflCode, scope.dropCode).then(function (val) {
                            if (val) {
                                data = val;
                            }
                            element.html(data);
                        });
                    }

                    changeHtmlVal(scope.dropCode);
                };
            }
        };
    }]);

}());
