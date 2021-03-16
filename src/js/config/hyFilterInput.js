/**
 * Created by lx on 2018/4/27.
 */
/*
 * jiangjiabin
 * hyaUserContainerClass: //内容样式
 * hyaUserInputClass // input样式
 * hyaIconClass// 删除图标样式
 * hyaType//痕迹类别 yhbh gzdbh 默认为用户编号
 * hyaPlaceholder //输入框的空值展示信息
 * */
(function () {
    "use strict";
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }
    module.factory('hyFilterInputView', HyFilterInputView)
        .directive('hyFilterInput', HyFilterInputDirective);

    function HyFilterInputView() {
        var hyInputClearView = Class.extend({
            init: function (scope, element, attrs) {
                this._element = element;
                this._scope = scope;
                this._attrs = attrs;
                this._dataList = [];
                this._scope.showInputDelIcon = false;

                this._scope.hyaPlaceholder = this._scope.hyaPlaceholder || '请输入';
                //如果存在图标的样式文件，则清空字体图标样式，如果没有则默认赋值字体样式
                if (!this._scope.hyaIconClass) {
                    this._scope.hyaIcon = 'ion-close-circled';
                } else {
                    this._scope.hyaIcon = this._scope.hyaIconClass;
                }

                this._scope.clearHyInputText = angular.bind(this, this._clearHyInputText);  //清除信息
                this._scope.contentShow = angular.bind(this, this._contentShow);  //选择列表
                this._scope.hideList = angular.bind(this, this._hideList); //隐藏列表
                this._scope.showList = angular.bind(this, this._showList);  //展示列表
                this._scope.deleteItem = angular.bind(this, this._deleteItem);  //删除列表元素

                this.flag=false;
                //监听指令vlaue值得变化
                this._scope.$watch('value', this._initIconShow.bind(this));//判断信息框的图标展示
                this._scope.showIcon = angular.bind(this, this._showIcon);//展示图标

                element.bind('click', function (e) {
                    e.stopPropagation(); //停止冒泡

                });
                angular.element(document.body).bind('click', function () {
                    scope.hideList();
                });
            },
            //设置下拉dataList
            _setDataList: function(dataList){
                this._dataList =  dataList;
            },
            //判断展示图标
            _showIcon: function () {
                var show = this._attrs.hyaShowIcon;
                if (show == "true") {
                    return true;
                } else {
                    return false;
                }
            },
            //清除信息
            _clearHyInputText: function () {
                this._scope.value = "";
                this._hideList();
            },
            //选择列表
            _contentShow: function (item) {
                this._hideList();
                var input = angular.element(this._element.find("input")[0]);
                input.val(item.VALUE);
                this._scope.value = item.VALUE;
                this._scope.selectFn({$a: item});
            },
            //隐藏列表
            _hideList: function () {
                this.flag=false;
                var self=this;
                setTimeout(function () {
                    var ul = angular.element(self._element[0].querySelector('.hyList'));
                    ul.css("display", "none");
                    self._scope.hyaIconShow="";
                    self._scope.$apply();
                },1)
            },
            //展示列表
            _showList: function () {
                this.flag=true;
                var self = this;
                this._initIconShow();
                var input = angular.element(this._element.find("input"))[0];
                input.focus();
                var ul = angular.element(this._element[0].querySelector('.hyList'));
                ul.css("display", "block");
                this._scope.hyaItems = this._dataList;
            },
            //判断信息框的图标展示
            _initIconShow: function () {
                if(this._scope.value){
                    this._scope.showInputDelIcon = true;
                }else{
                    this._scope.showInputDelIcon = false;
                }
                if(!this.flag)return;
                if (this._scope.value !== null && this._scope.value !== undefined && this._scope.value !== "") {
                    this._scope.hyaIconShow = "show";
                } else {
                    this._scope.hyaIconShow = "";
                }
            },
            //删除列表元素
            _deleteItem: function (item, index, $event) {
                this._scope.hyaItems.splice(index, 1);
                this._scope.deleteFn({$a: item});
            }
        });
        return hyInputClearView;
    }

    function HyFilterInputDirective($onsen, hyFilterInputView) {
        return {
            restrict: 'E',
            scope: {
                hyaUserContainerClass: '@', //内容样式
                hyaUserInputClass: '@', // input样式
                hyaShowIcon: '@', // 展示删除元素图标
                hyaIconClass: '@',// 删除图标样式
                hyaType: '@',//痕迹类别 yhbh gzdbh 默认为用户编号
                hyaPlaceholder: '@', //输入框的空值展示信息
                hyaDataList: '=',
                value: '=hyValue',
                selectFn:'&hyaSelectFn',
                deleteFn:'&hyaDeleteFn'
            },
            template: '<div class="autocomplete hy-filter-input">\
						  <div class="hy-filter-input-input">\
						    <input ng-model="value" ng-focus = "showList()" placeholder="{{hyaPlaceholder}}"  />\
						    <i ng-show="showInputDelIcon"class="hy-filter-input-clear-icon ion-close-circled"  ng-click="clearHyInputText()"></i>\
						  </div>\
						  <div class = "filter-input-list hy-filter-input-drop hyList"  >\
							<div class="filter-input-item hy-layout-row hy-layout-align-space-between-center drop-item" ng-repeat="item in hyaItems | filter:{VALUE:value} track by $index" ng-show="$index<5">\
							    <div class="drop-text" ng-click="contentShow(item)">{{item.VALUE}}</div>\
                                <i class="ion-close drop-del-icon"  ng-click="deleteItem(item,$index,$event)" ng-if = "showIcon()"></i>\
							</div>\
						  </div>\
			          </div>',
            link: function (scope, element, attrs) {
                var containerStyle = attrs.hyaUserContainerClass;
                var div = angular.element(element.find("div")[0]);
                div.addClass(containerStyle);
                var inputStyle = attrs.hyaUserInputClass;
                var input = angular.element(element.find("input")[0]);
                input.addClass(inputStyle);
                var hyMapView = new hyFilterInputView(scope, element, attrs);
                hyMapView._setDataList(scope.hyaDataList);
                $onsen.declareVarAttribute(attrs, hyMapView);
            }
        }
    }
})();