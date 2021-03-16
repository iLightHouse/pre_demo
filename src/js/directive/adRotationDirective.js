/**
 * Created by keyu on 2017/11/14.
 * 通知公告滚动指令
 */

app.factory('HyAdRotationService', ['$onsen','$interval','$sce',
    function ($onsen,$interval,$sce) {
        var HyAdRotationService = Class.extend({
            init: function (scope, element, attrs) {
                this._scope = scope;
                this._element = element;
                this._attrs = attrs;

                this._scope.itemClick = this._itemClicked.bind(this);
                this._scope.trustAsHtml = function(html){
                    if(!html) return '';
                    return $sce.trustAsHtml(html);
                };
                this.stop = false;
                this.itemIndex = 1;
                this._start();

            },
            /**
             * 开始滚动
             * @private
             */
            _start:function(){
                this._stop();
                this.stop = false;
                this.inter = $interval(function(){
                    this._translateTo();
                }.bind(this),5*1000);
            },
            /**
             * 结束滚动
             * @private
             */
            _stop:function(){
                if(this.inter){
                    $interval.cancel(this.inter);
                    this.inter = undefined;
                }
                this.stop = true;
            },
            /**
             * 动画实现翻滚
             * @param options
             * @private
             */
            _translateTo: function (options) {
                //return;
                if(this.stop) return;
                var scrollEle = this._element.children();
                if(!this._scope.items||!scrollEle||scrollEle.length<=0) return;
                options = options || {};
                this.itemIndex++;
                if(this.itemIndex>this._scope.items.length){
                    this.itemIndex = 1;
                }
                var height = this._getHeight();
                var scroll = -(height*(this.itemIndex-1));
                animit(scrollEle[0])
                    .queue({
                        transform: 'translate3d(0px, ' + scroll + 'px, 0px)'
                    }, {
                        duration: 0.3,
                        timing: 'cubic-bezier(.1, .7, .1, 1)'
                    })
                    .play(options.callback);
            },
            /**
             * 点击事件
             * @param item
             * @private
             */
            _itemClicked: function (item,index) {
                if(!this._scope.itemClickFn) return;
                this._scope.itemClickFn({$item:item,$index:index});
            },
            /**
             * 获取高度
             * @returns {Number}
             * @private
             */
            _getHeight: function () {
                return this._element[0].getBoundingClientRect().height;
            },
            _createEventListeners: function () {
                //var element = this._element;
                //
                //this._hammer = new Hammer(element[0], {
                //    dragMinDistance: 1,
                //    dragDistanceCorrection: false
                //});
            },

            _destroyEventListeners: function () {
                var element = this._element;
            },
            destroy: function () {
                this._scope.$destroy();
            },
            _destroy: function () {
                this._scope = undefined;
                this._element = undefined;
                this._attrs = undefined;
            }
        });

        MicroEvent.mixin(HyAdRotationService);
        return HyAdRotationService;
    }]);

app.directive('hyAdRotation', ['HyAdRotationService', '$onsen', function (HyAdRotationService, $onsen) {
    return {
        restrict: 'E',
        scope: {
            items:'=',
            itemClickFn:'&hyItemClick'
        },
        replace: true,
        template: '<div class="ad-rotation"><div class="ad-rotation-list">' +
            '<div class="ad-rotation-item" ng-repeat="item in items track by $index" ng-click="itemClick(item,$index);">' +
                '<div class="item-text" ng-if="!item.html" ng-bind="item.title"></div>' +
                '<div class="item-text" ng-if="item.html" ng-bind-html="trustAsHtml(item.html)"></div>' +
            '</div>' +
        '</div></div>',
        compile: function (element, attrs) {
            return function (scope, element, attrs) {
                var adRotationService = new HyAdRotationService(scope, element, attrs);
                $onsen.declareVarAttribute(attrs, adRotationService);
            };
        }
    };
}]);
