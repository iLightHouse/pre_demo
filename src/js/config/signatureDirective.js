/**
 * Version:1.0.0
 * Author:刘克玉
 * Date:2017/09/25
 * 电子签名指令
 */
(function (module) {
    try {
        module = angular.module('templates-main');
    } catch (err) {
        module = angular.module('templates-main', []);
    }
    module.run(['$templateCache', function ($templateCache) {
        'use strict';
        $templateCache.put('templates/hy_signature_dialog.tpl',
            '<ons-dialog cancelable class="hy-signature-dialog">\
                <div class="signature-content">\
                    <div class="signature-close-btn" ng-click="close()">\
                        <i class="fa fa-times-circle-o"></i>\
                    </div>\
                    <div class="signature-clear-btn" ng-click="clear()">\
                        <i class="fa fa-times"></i>\
                    </div>\
                    <div class="signature-ok-btn" ng-click="submit()">\
                        <i class="fa fa-check"></i>\
                    </div>\
                    <div id="handSignatureId" class="hand-sign-canvas"></div>\
                </div>\
            </ons-dialog>');
    }]);
})();
/**
 * 电子签名服务。
 */
(function () {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }
    module.factory('HySignatureService', ['$onsen', '$q', '$appConfig', '$timeout',
        function ($onsen, $q, $appConfig, $timeout) {
            var HySignatureService;
            HySignatureService = Class.extend({
                defaultOpts: {
                    lineColor: '#000000',
                    lineWidth: 3,
                    border: '1px dashed #AAAAAA',
                    background: '#FFFFFF'
                },
                /**
                 * 初始化
                 * @param scope
                 * @param element
                 * @param attrs
                 */
                init: function (scope, element, attrs) {
                    this._scope = scope;
                    this._element = element;
                    this._attrs = attrs;
                    this._scope.handSign = this._scope.handSign || {};
                    var options = this._scope.options || {};

                    this.pointsList = [];
                    this.points = [];

                    this.options = angular.extend({}, this.defaultOpts, options);
                    this.handSignId = attrs.id;
                    this._scope.showSignDialog = this.showDialog.bind(this);
                    this._scope.close = this.closeDialog.bind(this);
                    this._scope.clear = this.clearCanvas.bind(this);
                    this._scope.submit = this._submit.bind(this);
                    this._scope.$on('$destroy', this._destroy.bind(this));
                },
                /**
                 * 画布初始化
                 * @private
                 */
                _initCanvas: function () {
                    var ele = this._querySelector('#handSignatureId');
                    this.$canvas = angular.element('<canvas></canvas>');

                    this.$canvas.attr({
                        width: ele[0].clientWidth - 2,
                        height: ele[0].clientHeight - 2
                    });
                    ele.append(this.$canvas);
                    this.$canvas.css({
                        boxSizing: 'border-box',
                        border: this.options.border,
                        background: this.options.background,
                        cursor: 'crosshair'
                    });
                    this.canvas = this.$canvas[0];
                    this._resetCanvas();
                    this._createEventListeners();
                },
                /**
                 * 开始画线
                 * @private
                 */
                _startDraw: function () {
                    // Start drawing
                    var self = this;
                    (function drawLoop() {
                        if (!self.drawing) return;
                        self.requestAnimFrame()(drawLoop);
                        self._renderCanvas();
                    })();
                },
                /**
                 * 加载原有签名
                 * @param src
                 * @private
                 */
                _drawOldHandSign: function (src) {
                    if (!src || !this.canvas || !this.ctx) return;
                    var self = this;
                    var img = new Image();
                    img.src = src;
                    img.onload = function () {
                        self.ctx.save();//保存状态
                        self.ctx.translate(0, 0);//设置画布上的(0,0)位置，也就是旋转的中心点
                        self.ctx.rotate(-90 * Math.PI / 180);
                        self.ctx.drawImage(img, 0, 0);//把图片绘制在旋转的中心点，
                        self.ctx.restore();//恢复状态
                    };
                },
                _onDrag: function (event) {
                    this.currentPos = this._getPosition(event);
                },

                _onDragStart: function (event) {
                    this.drawing = true;
                    this.lastPos = this.currentPos = this._getPosition(event);
                    this.points.push(this.lastPos);
                    this._startDraw();
                },

                _onDragEnd: function (event) {
                    this.drawing = false;
                    if (this.points.length > 0) {
                        this.pointsList.push(this.points);
                    }
                    this.points = [];
                },
                /**
                 * 创建事件
                 * @private
                 */
                _createEventListeners: function () {
                    var element = this.canvas;
                    if (!element) return;
                    this._hammer = new Hammer(element, {
                        dragMinDistance: 1,
                        dragDistanceCorrection: false
                    });

                    // Event listeners
                    this._bindedOnDrag = this._onDrag.bind(this);
                    this._bindedOnDragStart = this._onDragStart.bind(this);
                    this._bindedOnDragEnd = this._onDragEnd.bind(this);

                    // Bind listeners
                    this._hammer.on('pan', this._bindedOnDrag);
                    this._hammer.on('panstart', this._bindedOnDragStart);
                    this._hammer.on('panend', this._bindedOnDragEnd);
                },
                /**
                 * 删除事件
                 * @private
                 */
                _destroyEventListeners: function () {
                    if (!this.canvas) return;
                    this._hammer.off('pan', this._bindedOnDrag);
                    this._hammer.off('panstart', this._bindedOnDragStart);
                    this._hammer.off('panend', this._bindedOnDragEnd);
                },
                _querySelector: function (str, element) {
                    element = element || this._scope.dialog._dialog;
                    var ele = element[0].querySelector(str);
                    if (!ele) return null;
                    return angular.element(ele);
                },
                /**
                 * 执行画图
                 * @param callback
                 * @returns {*|Function}
                 */
                requestAnimFrame: function () {
                    return window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimaitonFrame ||
                        function (callback) {
                            if (this.timer) $timeout.cancel(this.timer);
                            this.timer = $timeout(callback, 1000 / 60);
                        };
                },
                /**
                 * 确定
                 */
                _submit: function () {
                    var src = this.getDataURL();
                    this._scope.handSign.src = src;
                    this._scope.handSign.signDate = src ? new Date() : null;
                    this.closeDialog();
                    //var img = this._element[0].querySelector('img.signature-image');
                    //if(!img) return;
                    //var scan = this.canvas.height/this.canvas.width;
                    //angular.element(img).css({
                    //    height:'100px',
                    //    width:(scan*100)+'px'
                    //});
                    if (this._scope.submitFn) {
                        this._scope.submitFn.call(this, {
                            $image: {
                                src: src,
                                width: this.canvas.height,
                                height: this.canvas.width
                            }, $date: this._scope.handSign.signDate, $key: this._scope.signatureKey
                        });
                    }
                },
                // Clear the canvas
                clearCanvas: function () {
                    this.canvas.width = this.canvas.width;
                    this.ctx.strokeStyle = this.options.lineColor;
                    this.ctx.lineWidth = this.options.lineWidth;
                    this.pointsList = [];
                    this.points = [];
                    //this._resetCanvas();
                },
                // Get the content of the canvas as a base64 data URL
                getDataURL: function () {
                    if (this.pointsList.length <= 0) return null;
                    var handSignCav = angular.element('<canvas></canvas>');
                    handSignCav.attr({
                        width: this.canvas.height,
                        height: this.canvas.width
                    });
                    handSignCav.css({
                        background: this.options.background,
                        cursor: 'crosshair'
                    });
                    for (var i = 0; i < this.pointsList.length; i++) {
                        this._drawLine(this.pointsList[i], handSignCav[0]);
                    }
                    return handSignCav[0].toDataURL('image/png', 0.8);
                },
                _drawLine: function (points, canvas) {
                    var ctx = canvas.getContext('2d');
                    ctx.strokeStyle = this.options.lineColor;
                    ctx.lineWidth = this.options.lineWidth;
                    for (var i = 0; i < points.length; i++) {
                        var newPoint = this._getRatePoint(points[i]);
                        if (i === 0) {
                            ctx.moveTo(newPoint.x, newPoint.y);
                            continue;
                        }
                        ctx.lineTo(newPoint.x, newPoint.y);
                        ctx.stroke();
                    }
                },
                _getRatePoint: function (point) {
                    var x = point.y;
                    var y = this.canvas.width - point.x;
                    return {x: x, y: y};
                },
                // Get the position of the mouse/touch
                _getPosition: function (event) {
                    var xPos, yPos, rect;
                    rect = this.canvas.getBoundingClientRect();

                    xPos = event.center.x;
                    yPos = event.center.y;
                    return {
                        x: xPos,
                        y: yPos
                    };
                },
                // Render the signature to the canvas
                _renderCanvas: function () {
                    if (!this.drawing) {
                        if (this.timer) $timeout.cancel(this.timer);
                        return;
                    }
                    this.points.push(this.currentPos);
                    this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
                    this.ctx.lineTo(this.currentPos.x, this.currentPos.y);
                    this.ctx.stroke();
                    this.lastPos = this.currentPos;
                },
                // Reset the canvas context
                _resetCanvas: function () {
                    this.ctx = this.canvas.getContext('2d');
                    this.ctx.strokeStyle = this.options.lineColor;
                    this.ctx.lineWidth = this.options.lineWidth;
                    //if(this._scope.handSign.src){
                    //    this._drawOldHandSign(this._scope.handSign.src);
                    //}
                },
                /**
                 * 配置dialog并显示
                 * @private
                 */
                _setDialog: function (dialog) {
                    this._scope.dialog = dialog;
                    //this._scope.dialog._element.addClass('drop-list-dialog');
                    this._scope.dialog.show({animation: 'none'});
                },
                /**
                 * 创建dialog
                 * @private
                 */
                _createDialog: function () {
                    if (this._scope.dialog) {
                        this._setDialog(this._scope.dialog);
                        return;
                    }
                    var page = $onsen.DIRECTIVE_TEMPLATE_URL + '/hy_signature_dialog.tpl';
                    ons.createDialog(page, {parentScope: this._scope}).then(function (dialog) {
                        this._setDialog(dialog);
                        this._initCanvas();
                    }.bind(this));
                },
                /**
                 * 关闭dialog
                 */
                closeDialog: function () {
                    if (!this._scope.dialog) return;
                    this._scope.dialog.hide({animation: 'none'});
                },
                /**
                 * 显示dialog
                 */
                showDialog: function () {
                    if (this._attrs.hasOwnProperty('disabled') && this._attrs['disabled'])
                        return;
                    if (!this._scope.dialog) {
                        this._createDialog();
                    } else {
                        this._setDialog(this._scope.dialog);
                    }
                },
                /**
                 * 销毁方法
                 */
                destroy: function () {
                    this._scope.$destroy();
                },
                _destroy: function () {
                    this._scope = undefined;
                    this._element = undefined;
                    this._attrs = undefined;
                    this._destroyEventListeners();
                }
            });

            MicroEvent.mixin(HySignatureService);
            return HySignatureService;
        }]);

    module.directive('hyHandSign', ['HySignatureService', '$onsen', function (HySignatureService, $onsen) {
        return {
            restrict: 'E',
            scope: {
                signatureKey: '@hyaSignatureKey',
                submitFn: '&hyaSubmit',
                handSign: '=hyaHandSign',
                options: '=hyaOptions'
            },
            replace: true,
            transclude: true,
            template: '<div class="signature-body" ng-click="showSignDialog();" >' +
                '<div>' +
                '<div class="hy-layout-row signature-display-font hy-layout-align-center-center">' +
                '<div class="hy-layout-row signature-row-header">簽名區:</div>' +
                '<div class="hy-layout-row signature-row-content">' +
                '<img ng-show="handSign.src" class="signature-image" ng-src="{{handSign.src}}" style="width: 175px;height: 100px;"/>' +
                '</div>' +
                '</div>' +
                '<div class="hy-layout-row signature-display-font hy-layout-align-center-center">' +
                '<div class="hy-layout-row signature-row-header">簽名時間:</div>' +
                '<div class="hy-layout-row signature-row-content">' +
                '{{handSign.signDate|date:\'yyyy-MM-dd HH:mm:ss\'}}' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',
            compile: function (element, attrs, transclude) {
                return function (scope, element, attrs, ngModel) {
                    transclude(scope.$parent, function (cloned) {
                        if (!cloned || cloned.length <= 0) return;
                        element.html('');
                        element.append(cloned);
                    });
                    var hySignatureService = new HySignatureService(scope, element, attrs);
                    $onsen.declareVarAttribute(attrs, hySignatureService);
                };
            }
        };
    }]);

}());
