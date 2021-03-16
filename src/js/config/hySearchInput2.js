/**
 * luzhiming
 * 搜索框样式2
 * 2018/12/26.
 */
(function(){
    "use strict";
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }
    module.directive("hySearchInput2",['$onsen',function($onsen){
        return{
            restrict:'E',
            template:'<div style="height: 31px;padding: 6px"><input type="search" class="hySearchInputStyle" ng-model="search" placeholder="{{hyaSearchHolder}}"/></div>' +
                '<i class = "ion-ios-search" style="position: absolute;top: 12px;left: 29px;font-size: 23px"></i>',
            link:function(scope,element,attrs){
                scope.hyaSearchHolder = attrs.hyaSearchHolder || 'search';
            },
        }
    }]);
}());