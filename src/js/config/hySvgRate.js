/**
 * svg比例图
 * Created by liukeyu on 2018/12/05.
 */
(function () {
    "use strict";
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }
    module.factory('HySvgRateView', HySvgRateView)
        .directive('hySvgRate', ['$onsen', 'HySvgRateView', HySvgRateDirective]);

    function HySvgRateView() {
        var HySvgRateView = Class.extend({
            svg: null,
            path: null,
            colors: null,
            linearGradientId: 'linearGradient',
            init: function (scope, element, attrs) {
                this._element = element;
                this._scope = scope;
                this._attrs = attrs;
                this._draw();

                this._scope.$on('$destroy', this._destroy.bind(this));
            },
            render: function ($val) {
                if (!this.svg) return;
                if (this.path) {
                    this.path.remove();
                }
                var val = $val || (this._scope.hyaRate || 0);
                if (val <= 0) return;
                var width = this._element[0].offsetWidth;
                var height = this._element[0].offsetHeight;
                var color = this._scope.hyaColor || ['#017bff', '#26bafe'];
                if (angular.isArray(color)) {
                    color = 'url(#' + this.linearGradientId + ')'
                }
                if (width < 200) width = 200;
                if (height < width / 2) height = width / 2;
                var R = (width - 10) / 2;
                var pathWidth = this._scope.hyaPathWidth || 40;
                this.path = this._drawPie({
                        R: R,
                        r: R - pathWidth,
                        width: width,
                        height: height,
                        startAngle: 300,
                        animate: true
                    },
                    {
                        angle: val * 120 / 100,
                        category: 'data',
                        color: color
                    });
                this.svg.appendChild(this.path);
            },
            _draw: function () {
                this._element.css({
                    width: '100%',
                    display: 'block',
                    'min-width': '200px',
                    'min-height': '100px'
                });
                var width = this._element[0].offsetWidth;
                var height = this._element[0].offsetHeight;
                var color = this._scope.hyaColor || ['#017bff', '#26bafe'];
                if (angular.isArray(color)) {
                    this.colors = color;
                    color = 'url(#' + this.linearGradientId + ')'
                }
                var backgroundColor = this._scope.hyaBackgroundColor || '#deeefe';
                if (width < 200) width = 200;
                if (height < width / 2) height = width / 2;
                var R = (width - 10) / 2;
                var pathWidth = this._scope.hyaPathWidth || 40;
                //创建svg标签，设置画布
                this.svg = this._createSvgTag('svg', {
                    'width': width + 'px',
                    'height': height + 'px',
                    'viewBox': '0 0 ' + width + ' ' + height
                });
                var bgPath = this._drawPie({R: R, r: R - pathWidth, width: width, height: height, startAngle: 300},
                    {
                        angle: 120,
                        category: '通讯',
                        color: backgroundColor
                    });
                this.svg.appendChild(bgPath);
                if (this.colors && this.colors.length >= 2) {
                    var stop1 = this._createSvgTag('stop', {
                        offset: '0%',
                        style: 'stop-color:' + this.colors[0] + ';stop-opacity:1'
                    });
                    var stop2 = this._createSvgTag('stop', {
                        offset: '100%',
                        style: 'stop-color:' + this.colors[1] + ';stop-opacity:1'
                    });
                    var linearGradient = this._createSvgTag('linearGradient', {
                        id: this.linearGradientId,
                        x1: '0%',
                        y1: '0%',
                        x2: '100%',
                        y2: '0%'
                    });
                    linearGradient.appendChild(stop1);
                    linearGradient.appendChild(stop2);
                    var defs = this._createSvgTag('defs', {});
                    defs.appendChild(linearGradient);
                    this.svg.appendChild(defs);
                }
                var self = this;
                if (this._attrs.hyaInit) {
                    this._scope.hyaInit.call(this, {
                        $done: function (data) {
                            self._scope.hyaRate = data || self._scope.hyaRate;
                            var val = self._scope.hyaRate || 0;
                            var pathWidth = self._scope.hyaPathWidth || 40;
                            if (val <= 0) return;
                            self.path = self._drawPie(
                                {R: R, r: R - pathWidth, width: width, height: height, startAngle: 300},
                                {
                                    angle: val * 120 / 100,
                                    category: 'data',
                                    color: color
                                });
                            self.svg.appendChild(self.path);
                        }
                    });
                } else {
                    var val = self._scope.hyaRate || 0;
                    if (val <= 0) return;
                    self.path = this._drawPie({
                            R: R,
                            r: R - pathWidth,
                            width: width,
                            height: height,
                            startAngle: 300,
                            animate: true
                        },
                        {
                            angle: val * 120 / 100,
                            category: 'data',
                            color: color
                        });

                    self.svg.appendChild(self.path);
                }
                this._element.append(this.svg);
            },

            _drawPie: function (options, data) {
                var width = options.width || 300;
                var height = options.height || 300;
                var r = options.r;
                var R = options.R;


                var w = width;
                var h = height; //将width、height赋值给w、h
                var origin = [w / 2, h / 2]; //原点坐标
                var startAngle = options.startAngle || 0;//保存每项数据的起始点角度
                var sAngel = startAngle * Math.PI / 180;//计算弧度
                var eAngel = sAngel;//保存每项数据的结束角点度
                var leftPoints = []; //保存在左边的点
                var rightPoints = []; //保存在右边的点,分出左右是为了计算两点垂直间距是否靠太近


                var itemData = Object.assign({}, data);//copy一遍，不直接修改原数据
                var isLeft = false;
                var endAngule = startAngle + data.angle;
                endAngule = endAngule % 360;
                eAngel = (endAngule) * Math.PI / 180;//计算结束弧度
                itemData.arclineStarts = [
                    this._evaluateXY(r, sAngel, origin), //计算P0坐标
                    this._evaluateXY(R, sAngel, origin), //计算P1坐标
                    this._evaluateXY(R, eAngel, origin), //计算P2坐标
                    this._evaluateXY(r, eAngel, origin)  //计算P3坐标
                ];
                //大于Math.PI需要画大弧，否则画小弧
                itemData.LargeArcFlag = data.angle > 180 ? '1' : '0';
                //计算线条起始点公位置
                itemData.lineStart = this._evaluateXY(R, sAngel + (eAngel - sAngel) / 2, origin);
                //线条起点x值小于原点x值，在左侧，否则在右侧
                itemData.isLeft = isLeft = itemData.lineStart[0] < origin[0];
                //根据线条起点左右，设置结束点
                itemData.lineEnd = [(isLeft ? 0 : w), itemData.lineStart[1]];
                //线条起点y值小于原点y值，在上部，否则在下部，用于确实过挤往上/下移动
                itemData.top = itemData.lineStart[1] < origin[1];
                //根据线条起点左右，添加到leftPoints/rightPoints,用于处理过挤
                isLeft ? leftPoints.push(itemData) : rightPoints.push(itemData);

                var P = itemData.arclineStarts;//将path路四个点变量，赋值给变量p

                //创建path标签(份额)
                var path = this._createSvgTag('path', {
                    'fill': itemData.color, //设置填充色
                    'stroke': 'black',
                    'stroke-width': '0', //画笔大小为零
                    /**
                     * d属性设置路径字符串
                     * M ${P[0][0]} ${P[0][1]} 移动画笔到P0点
                     * L ${P[1][0]} ${P[1][1]} 绘制一条直线到P1
                     * A ${R} ${R} 0 ${v.LargeArcFlag} 1 ${P[2][0]} ${P[2][1]} 绘制外环弧到P2,R为外半径，v.LargeArcFlag画大弧还是小弧
                     * L ${P[3][0]} ${P[3][1]} 绘制一条直线到P3
                     * A ${r} ${r}  0 ${v.LargeArcFlag} 0 ${P[0][0]} ${P[0][1]} 绘制内环弧到P0点
                     * z 关闭路径
                     */
                    'd': 'M ' + P[0][0] + ' ' + P[0][1] + ' L ' + P[1][0] + ' ' + P[1][1] + ' A ' + R + ' ' + R + ' 0 ' + itemData.LargeArcFlag + ' 1 ' + P[2][0] + ' ' + P[2][1] + ' L ' + P[3][0] + ' ' + P[3][1] + ' A ' + r + ' ' + r + '  0 ' + itemData.LargeArcFlag + ' 0 ' + P[0][0] + ' ' + P[0][1] + ' z'
                });
                // path.style.transition = path.style.WebkitTransition = 'fill 50s ease-in';
                // //设置线条点
                // let linePoints = itemData.lineStart[0] + ' ' + itemData.lineStart[1]; //设置起点
                // //如果有折点，添加折点
                // itemData.turingPoints && (linePoints += ',' + itemData.turingPoints[0] + ' ' + itemData.turingPoints[1]);
                // //设置结束点
                // linePoints += ',' + itemData.lineEnd[0] + ' ' + itemData.lineEnd[1];
                // //创建polyline标签(线条)
                // let polyline = createSvgTag('polyline', {
                //     points: linePoints,
                //     style: `fill:none;stroke:${itemData.color};stroke-width:.5`
                // });
                // //创建text标签，显示花费
                // let cost = createSvgTag("text", {
                //     'x':  v.lineEnd[0],
                //     'y':  v.lineEnd[1],
                //     'dy': -2,
                //     style: `fill:${itemData.color};font-size:12px;text-anchor: ${v.isLeft? 'start':'end'};`
                // });
                // cost.innerHTML = itemData.cost;
                //创建text标签，显示花费分类
                // let category = createSvgTag("text", {
                //     'x':  itemData.lineEnd[0],
                //     'y':  itemData.lineEnd[1],
                //     'dy': 14,
                //     style: `fill:${itemData.color};font-size:12px;text-anchor: ${itemData.isLeft? 'start':'end'};`
                // });
                // category.innerHTML = itemData.category;

                // psvg.appendChild(path);  //path(份额)添加到画布中

                return path;
            },
            /**
             * 计算Xy坐标
             * @param  {[type]} r      [半径]
             * @param  {[type]} angel  [角度]
             * @param  {[type]} origin [原点坐标]
             * @return {[Array]} 坐标
             */
            _evaluateXY: function (r, angel, origin) {
                return [origin[0] + Math.sin(angel) * r, origin[0] - Math.cos(angel) * r]
            },
            /**
             * 将创建SVG标签写成一个函数
             * @param  {string} tagName    [标签名]
             * @param  {Object} attributes [标签属性]
             * @return {Element} svg标签
             */
            _createSvgTag: function (tagName, attributes) {
                var tag = document.createElementNS('http://www.w3.org/2000/svg', tagName);
                for (var attr in attributes) {
                    tag.setAttribute(attr, attributes[attr])
                }
                return tag;
            },
            _destroy: function () {
                this.emit('destroy');
                this._element = this._scope = this._attrs = null;
            }
        });
        MicroEvent.mixin(HySvgRateView);
        return HySvgRateView;
    }

    function HySvgRateDirective($onsen, HySvgRateView) {
        return {
            restrict: 'EA',
            scope: {
                hyaRate: '@',
                hyaPathWidth: '@',
                hyaColor: '@',
                hyaBackgroundColor: '@',
                hyaInit: '&'
            },
            link: function (scope, element, attrs) {
                var hySvgRateView = new HySvgRateView(scope, element, attrs);
                $onsen.declareVarAttribute(attrs, hySvgRateView);
            }
        }
    }
})();
