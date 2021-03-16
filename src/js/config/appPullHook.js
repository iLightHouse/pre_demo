/**
 * Created by 50265 on 2018/8/14.
 * 下拉刷新
 */

(function () {
    'use strict';
    var module = angular.module('onsen');

    module.factory('AppPullHookView', ['$onsen', function ($onsen) {

        var AppPullHookView = Class.extend({

            STATE_INITIAL: 'initial',
            STATE_PREACTION: 'preaction',
            STATE_ACTION: 'action',

            /**
             * @param {Object} scope
             * @param {jqLite} element
             * @param {Object} attrs
             */
            init: function (scope, element, attrs) {
                this._element = element;
                this._scope = scope;
                this._attrs = attrs;

                this._pullHookScroll = this._createPullHookScroll();
                this._parentElement = this._pullHookScroll.parent();
                this._currentTranslation = 0;

                this._createEventListeners();
                this._setState(this.STATE_INITIAL, true);
                this._setStyle();

                this._scope.$on('$destroy', this._destroy.bind(this));
            },
            _createPullHookScroll:function(){
                var scrollElement = angular.element('<div>')
                    .addClass('scroll');

                var pageElement = this._element.parent(),
                    children = pageElement.children();

                pageElement.append(scrollElement);
                scrollElement.append(children);

                return scrollElement;
            },

            _setStyle: function () {
                var h = this._getHeight();
                this._pullHookScroll.css({
                    position:'relative',
                    touchAction:'auto'
                });
                this._element.css({
                    top: '-' + h + 'px',
                    height: h + 'px',
                    lineHeight: h + 'px',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    textAlign: 'center'
                });
            },

            _onScroll: function (event) {
                var el = this._parentElement[0];

                if (el.scrollTop < 0) {
                    el.scrollTop = 0;
                }
                if(el.scrollTop==0){
                    this._pullHookScroll.css({
                        touchAction:'none'
                    });
                }else{
                    this._pullHookScroll.css({
                        touchAction:'auto'
                    });
                }
            },

            _generateTranslationTransform: function (scroll) {
                return 'translate3d(0px, ' + scroll + 'px, 0px)';
            },

            _onDrag: function (event) {
                if (this.isDisabled()) {
                    return;
                }

                // Ignore when dragging left and right.
                if (event.direction === Hammer.DIRECTION_LEFT || event.direction === Hammer.DIRECTION_RIGHT) {
                    return;
                }

                // Hack to make it work on Android 4.4 WebView. Scrolls manually near the top of the page so
                // there will be no inertial scroll when scrolling down. Allowing default scrolling will
                // kill all 'touchmove' events.
                var el = this._parentElement[0];
                if(el.scrollTop>0) return;

                //el.scrollTop = this._startScroll - event.deltaY;
                //if (el.scrollTop < window.innerHeight && event.direction !== Hammer.DIRECTION_UP) {
                //    event.preventDefault();
                //}
                var scroll = event.deltaY - this._startScroll;

                scroll = Math.max(scroll, 0);

                if (this._thresholdHeightEnabled() && scroll >= this._getThresholdHeight()) {
                    this._hammer.stop();
                    this._pullHookScroll.css({
                        touchAction:'auto'
                    });
                    setImmediate(function () {
                        this._setState(this.STATE_ACTION);
                        this._translateTo(this._getHeight(), {animate: true});

                        this._waitForAction(this._onDone.bind(this));
                    }.bind(this));
                }
                else if (scroll >= this._getHeight()) {
                    this._setState(this.STATE_PREACTION);
                }
                else {
                    this._setState(this.STATE_INITIAL);
                }

                event.srcEvent.stopPropagation();
                this._translateTo(scroll);
            },

            _onDragStart: function (event) {
                if (this.isDisabled()) {
                    return;
                }

                this._startScroll = this._getCurrentScroll();
                if(this._startScroll<=0){
                    this._pullHookScroll.css({
                        touchAction:'none'
                    });
                }else{
                    this._pullHookScroll.css({
                        touchAction:'auto'
                    });
                }
            },

            _onDragEnd: function (event) {
                if (this.isDisabled()) {
                    return;
                }
                this._pullHookScroll.css({
                    touchAction:'auto'
                });
                if (this._currentTranslation > 0) {
                    var scroll = this._currentTranslation;

                    if (scroll > this._getHeight()) {
                        this._setState(this.STATE_ACTION);

                        this._translateTo(this._getHeight(), {animate: true});

                        this._waitForAction(this._onDone.bind(this));
                    }
                    else {
                        this._translateTo(0, {animate: true});
                    }
                }
            },

            _waitForAction: function (done) {
                if (this._attrs.ngAction) {
                    this._scope.$eval(this._attrs.ngAction, {$done: done});
                }
                else if (this._attrs.onAction) {
                    /*jshint evil:true */
                    eval(this._attrs.onAction);
                }
                else {
                    done();
                }
            },

            _onDone: function (done) {
                // Check if the pull hook still exists.
                if (this._element) {
                    this._translateTo(0, {animate: true});
                    this._setState(this.STATE_INITIAL);
                }
            },

            _getHeight: function () {
                return parseInt(this._element[0].getAttribute('height') || '64', 10);
            },

            setHeight: function (height) {
                this._element[0].setAttribute('height', height + 'px');

                this._setStyle();
            },

            setThresholdHeight: function (thresholdHeight) {
                this._element[0].setAttribute('threshold-height', thresholdHeight + 'px');
            },

            _getThresholdHeight: function () {
                return parseInt(this._element[0].getAttribute('threshold-height') || '96', 10);
            },

            _thresholdHeightEnabled: function () {
                var th = this._getThresholdHeight();
                return th > 0 && th >= this._getHeight();
            },

            _setState: function (state, noEvent) {
                var oldState = this._getState();

                this._scope.$evalAsync(function () {
                    this._element[0].setAttribute('state', state);

                    if (!noEvent && oldState !== this._getState()) {
                        this.emit('changestate', {
                            state: state,
                            pullHook: this
                        });
                    }
                }.bind(this));
            },

            _getState: function () {
                return this._element[0].getAttribute('state');
            },

            getCurrentState: function () {
                return this._getState();
            },

            _getCurrentScroll: function () {
                return this._parentElement[0].scrollTop;
            },

            isDisabled: function () {
                return this._element[0].hasAttribute('disabled');
            },

            setDisabled: function (disabled) {
                if (disabled) {
                    this._element[0].setAttribute('disabled', '');
                }
                else {
                    this._element[0].removeAttribute('disabled');
                }
            },

            _translateTo: function (scroll, options) {
                options = options || {};

                this._currentTranslation = scroll;

                if (options.animate) {
                    animit(this._pullHookScroll[0])
                        .queue({
                            transform: this._generateTranslationTransform(scroll)
                        }, {
                            duration: 0.3,
                            timing: 'cubic-bezier(.1, .7, .1, 1)'
                        })
                        .play(options.callback);
                }
                else {
                    animit(this._pullHookScroll[0])
                        .queue({
                            transform: this._generateTranslationTransform(scroll)
                        })
                        .play(options.callback);
                }
            },

            _createEventListeners: function () {
                var element = this._pullHookScroll;

                this._hammer = new Hammer(element[0], {
                    dragMinDistance: 1,
                    dragDistanceCorrection: false
                });

                // Event listeners
                this._bindedOnDrag = this._onDrag.bind(this);
                this._bindedOnDragStart = this._onDragStart.bind(this);
                this._bindedOnDragEnd = this._onDragEnd.bind(this);
                this._bindedOnScroll = this._onScroll.bind(this);

                // Bind listeners
                this._hammer.on('pan', this._bindedOnDrag);
                this._hammer.on('panstart', this._bindedOnDragStart);
                this._hammer.on('panend', this._bindedOnDragEnd);
                element.on('scroll', this._bindedOnScroll);
            },

            _destroyEventListeners: function () {
                var element = this._pullHookScroll;

                this._hammer.off('pan', this._bindedOnDrag);
                this._hammer.off('panstart', this._bindedOnDragStart);
                this._hammer.off('panend', this._bindedOnDragEnd);
                element.off('scroll', this._bindedOnScroll);
            },

            _destroy: function () {
                this.emit('destroy');
                this._destroyEventListeners();
                this._element = this._scope = this._attrs = null;
            }
        });

        MicroEvent.mixin(AppPullHookView);
        return AppPullHookView;
    }]);
})();

(function () {
    'use strict';

    var module = angular.module('onsen');

    /**
     * Pull hook directive.
     */
    module.directive('appPullHook', ['$onsen', 'AppPullHookView', function ($onsen, AppPullHookView) {
        return {
            restrict: 'EA',
            replace: false,
            scope: true,
            compile: function (element, attrs) {
                return {
                    pre: function (scope, element, attrs) {
                        var pullHook = new AppPullHookView(scope, element, attrs);

                        $onsen.declareVarAttribute(attrs, pullHook);
                        $onsen.registerEventHandlers(pullHook, 'changestate destroy');
                        element.data('app-pull-hook', pullHook);

                        scope.$on('$destroy', function () {
                            pullHook._events = undefined;
                            element.data('app-pull-hook', undefined);
                            scope = element = attrs = null;
                        });
                    },
                    post: function (scope, element) {
                        $onsen.fireComponentEvent(element[0], 'init');
                    }
                };
            }
        };
    }]);

})();
