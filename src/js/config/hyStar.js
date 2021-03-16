/**
 * 孙若胜 2019-02-15
 * 评价星星
 * hyMax最多有几个星星，默认5个
 * hyChoose是否可以选择
 */
(function () {
    "use strict";
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }

    module.directive('hyStar', ['$timeout', '$onsen', function ($timeout, $onsen) {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                hyMax: '&',
                hyChoose: '&'
            },
            template: getTemple,
            link: function (scope, element, attrs) {
                scope.stars = [];
                if (!attrs.hyMax) {
                    attrs.hyMax = 5;
                }
                for (var i = 0; i < attrs.hyMax; i++) {
                    scope.stars.push({
                        value: i,
                        select: false
                    });
                }
                if (scope.ngModel) {
                    for (var i = 0; i < scope.stars.length; i++) {
                        if (scope.ngModel - 1 >= scope.stars[i].value) {
                            scope.stars[i].select = true;
                        }
                    }
                }
                scope.selectMenu = function (obj) {
                    if (attrs.hyChoose) {
                        return;
                    }
                    scope.ngModel = obj.value + 1;
                    for (var i = 0; i < scope.stars.length; i++) {
                        scope.stars[i].select = false;
                    }
                    for (var i = 0; i < scope.stars.length; i++) {
                        if (obj.value >= scope.stars[i].value) {
                            scope.stars[i].select = true;
                        }
                    }
                }

            }
        };

        function getTemple() {
            var html = " <a ng-repeat='col in stars'>" +
                '<i ng-if="col.select" class="icon ion-ios-star energized" ng-click="selectMenu(col)" style="font-size: 30px;color:#ECB22A;"></i>' +
                "<i ng-if='!col.select' class='icon ion-ios-star-outline' ng-click='selectMenu(col)' style='font-size: 30px;color:#ECB22A'></i>" +
                "</a>";
            return html;
        }

    }
    ]);

}());
