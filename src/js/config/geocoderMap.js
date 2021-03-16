/**
 * 公共工具服务 - v1.0.0 - 2017-06-29
 * @author magee_yang
 * @ngdoc service
 * @name UtilService
 * @description
 *   公共工具服务
 *   包括对GPS坐标等公共数据的处理方法
 * @example
 */
(function () {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }

    module.factory('UtilService', ['$q', function ($q) {
        // 定位数据的超时时间
        var GEOLOCATION_TIMEOUT = 5 * 60 * 1000;
        var utilService = {
            //应用的当前坐标
            _geolocation      : null,
            setGeolocation    : function (location,type) {
                this._geolocation = {
                    coords   : location || {},
                    timestamp: new Date().getTime(),
                    type : type || 'html5'
                };
            },
            getGeolocation    : function (options) {
                var defered = $q.defer();
                options = options || {enableHighAccuracy: true, timeout: 10000};
                if (this.isGeolocationValid()) {
                    if (window.AMapNavi) {
                        window.AMapNavi.getCurrentPosition(options, function (e) {
                            utilService.setGeolocation(e,'gaode');
                        });
                    } else {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            utilService.setGeolocation(position.coords);
                        })
                    }
                    defered.resolve(this._geolocation);
                } else {
                    if (window.AMapNavi) {
                        window.AMapNavi.getCurrentPosition(options, function (e) {
                            utilService.setGeolocation(e,'gaode');
                            defered.resolve(utilService._geolocation);
                        }, function (error) {
                            defered.reject(error);
                        });
                    } else {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            utilService.setGeolocation(position.coords);
                            defered.resolve(utilService._geolocation);
                        }, function (error) {
                            defered.reject(error);
                        })
                    }
                }

                return defered.promise;
            },
            isGeolocationValid: function () {
                if (this._geolocation === null) {
                    return false;
                }
                var timeDif = new Date().getTime() - this._geolocation.timestamp;
                return timeDif <= GEOLOCATION_TIMEOUT;
            }
        };

        return utilService;
    }]);
})();
/**
 * GPSTranslate - v1.0.0 - 2016-03-10
 * @author liukeyu
 * @ngdoc service
 * @name GPSTranslate
 * @description
 *   [ch]坐标转换服务.[/en]
 * @example
 */
(function() {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }

    module.factory('GPSTranslate', function ($onsen) {
        var GPSTranslate = Class.extend({
            PI : 3.14159265358979324,
            x_pi : 3.14159265358979324 * 3000.0 / 180.0,
            delta : function (lat, lon) {
                // Krasovsky 1940
                //
                // a = 6378245.0, 1/f = 298.3
                // b = a * (1 - f)
                // ee = (a^2 - b^2) / a^2;
                var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
                var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
                var dLat = this.transformLat(lon - 105.0, lat - 35.0);
                var dLon = this.transformLon(lon - 105.0, lat - 35.0);
                var radLat = lat / 180.0 * this.PI;
                var magic = Math.sin(radLat);
                magic = 1 - ee * magic * magic;
                var sqrtMagic = Math.sqrt(magic);
                dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
                dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
                return {'lat': dLat, 'lon': dLon};
            },

            //WGS-84 to GCJ-02
            gcj_encrypt : function (wgsLat, wgsLon) {
                if (this.outOfChina(wgsLat, wgsLon))
                    return {'lat': wgsLat, 'lon': wgsLon};

                var d = this.delta(wgsLat, wgsLon);
                return {'lat' : wgsLat + d.lat,'lon' : wgsLon + d.lon};
            },
            //GCJ-02 to WGS-84
            gcj_decrypt : function (gcjLat, gcjLon) {
                if (this.outOfChina(gcjLat, gcjLon))
                    return {'lat': gcjLat, 'lon': gcjLon};

                var d = this.delta(gcjLat, gcjLon);
                return {'lat': gcjLat - d.lat, 'lon': gcjLon - d.lon};
            },
            //GCJ-02 to WGS-84 exactly
            gcj_decrypt_exact : function (gcjLat, gcjLon) {
                var initDelta = 0.01;
                var threshold = 0.000000001;
                var dLat = initDelta, dLon = initDelta;
                var mLat = gcjLat - dLat, mLon = gcjLon - dLon;
                var pLat = gcjLat + dLat, pLon = gcjLon + dLon;
                var wgsLat, wgsLon, i = 0;
                while (1) {
                    wgsLat = (mLat + pLat) / 2;
                    wgsLon = (mLon + pLon) / 2;
                    var tmp = this.gcj_encrypt(wgsLat, wgsLon)
                    dLat = tmp.lat - gcjLat;
                    dLon = tmp.lon - gcjLon;
                    if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
                        break;

                    if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
                    if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

                    if (++i > 10000) break;
                }
                return {'lat': wgsLat, 'lon': wgsLon};
            },
            //GCJ-02 to BD-09
            bd_encrypt : function (gcjLat, gcjLon) {
                var x = gcjLon, y = gcjLat;
                var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
                var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
                var bdLon = z * Math.cos(theta) + 0.0065;
                var bdLat = z * Math.sin(theta) + 0.006;
                return {'lat' : bdLat,'lon' : bdLon};
            },
            //BD-09 to GCJ-02
            bd_decrypt : function (bdLat, bdLon) {
                var x = bdLon - 0.0065, y = bdLat - 0.006;
                var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
                var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
                var gcjLon = z * Math.cos(theta);
                var gcjLat = z * Math.sin(theta);
                return {'lat' : gcjLat, 'lon' : gcjLon};
            },
            //WGS-84 to Web mercator
            //mercatorLat -> y mercatorLon -> x
            mercator_encrypt : function(wgsLat, wgsLon) {
                var x = wgsLon * 20037508.34 / 180.;
                var y = Math.log(Math.tan((90. + wgsLat) * this.PI / 360.)) / (this.PI / 180.);
                y = y * 20037508.34 / 180.;
                return {'lat' : y, 'lon' : x};
                /*
                 if ((Math.abs(wgsLon) > 180 || Math.abs(wgsLat) > 90))
                 return null;
                 var x = 6378137.0 * wgsLon * 0.017453292519943295;
                 var a = wgsLat * 0.017453292519943295;
                 var y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
                 return {'lat' : y, 'lon' : x};
                 //*/
            },
            // Web mercator to WGS-84
            // mercatorLat -> y mercatorLon -> x
            mercator_decrypt : function(mercatorLat, mercatorLon) {
                var x = mercatorLon / 20037508.34 * 180.;
                var y = mercatorLat / 20037508.34 * 180.;
                y = 180 / this.PI * (2 * Math.atan(Math.exp(y * this.PI / 180.)) - this.PI / 2);
                return {'lat' : y, 'lon' : x};
                /*
                 if (Math.abs(mercatorLon) < 180 && Math.abs(mercatorLat) < 90)
                 return null;
                 if ((Math.abs(mercatorLon) > 20037508.3427892) || (Math.abs(mercatorLat) > 20037508.3427892))
                 return null;
                 var a = mercatorLon / 6378137.0 * 57.295779513082323;
                 var x = a - (Math.floor(((a + 180.0) / 360.0)) * 360.0);
                 var y = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * mercatorLat) / 6378137.0)))) * 57.295779513082323;
                 return {'lat' : y, 'lon' : x};
                 //*/
            },
            // two point's distance
            distance : function (latA, lonA, latB, lonB) {
                var earthR = 6371000.;
                var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lonA - lonB) * this.PI / 180);
                var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);
                var s = x + y;
                if (s > 1) s = 1;
                if (s < -1) s = -1;
                var alpha = Math.acos(s);
                var distance = alpha * earthR;
                return distance;
            },
            outOfChina : function (lat, lon) {
                if (lon < 72.004 || lon > 137.8347)
                    return true;
                if (lat < 0.8293 || lat > 55.8271)
                    return true;
                return false;
            },
            transformLat : function (x, y) {
                var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
                ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
                ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
                return ret;
            },
            transformLon : function (x, y) {
                var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
                ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
                ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
                return ret;
            }
        });

        MicroEvent.mixin(GPSTranslate);
        return GPSTranslate;
    });
})();
/**
 * HyGeolocationView - v1.0.0 - 2016-03-10
 * @author liukeyu
 * @ngdoc service
 * @name HyGeolocationView
 * @description
 *   [ch]定位服务.[/en]
 * @example
 */
(function() {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }

    module.factory('HyGeolocationView', function () {
        var HyGeolocationView = Class.extend({
            isInit:false,
            /**
             * @param {Object} scope
             * @param {jqLite} element
             * @param {Object} attrs
             */
            init: function (success, error, options) {
                this.isInit = true;
                this.type = 'html5';//HTML5
                this._success = success;
                this._error = error;
                this._options = options || {enableHighAccuracy: true,timeout: 30000};
                this._geolocation = {};
                var self = this;
                //高德
                if(window.AMapNavi){
                    this._geolocation.getCurrentPosition = function(success, error, options){
                        window.AMapNavi.getCurrentPosition(options,function(e){
                            var res = e;
                            res.coords = {
                                latitude:e.latitude,
                                longitude:e.longitude,
                                accuracy: e.accuracy,
                                address: e.address,
                                city: e.city
                            };
                            if(success && angular.isFunction(success)){
                                success.call(self,res);
                            }
                        },error);
                    };
                    this.type = 'gaode';//高德
                    return;
                }
                //微信
                if(this.isWeixin()&&window.wx){
                    this._geolocation.getCurrentPosition = function(success, error, options){
                        window.wx.getLocation({
                            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                            success:function(e){
                                var res = e;
                                res.coords = {
                                    latitude:e.latitude,
                                    longitude:e.longitude
                                };
                                if(success && angular.isFunction(success)){
                                    success.call(self,res);
                                }
                            }
                        });
                    };
                    this.type = 'weixin';//Weixin
                    return;
                }
                //html
                if (navigator && navigator.geolocation) {
                    this._geolocation.getCurrentPosition = function(success, error, options){
                        navigator.geolocation.getCurrentPosition(function(e){
                            var res = {};
                            if(e && e.coords){
                                res.coords = {
                                    latitude:e.coords.latitude,
                                    longitude:e.coords.longitude,
                                    accuracy: e.coords.accuracy,
                                    altitude: e.coords.altitude,
                                    altitudeAccuracy: e.coords.altitudeAccuracy,
                                    speed: e.coords.speed
                                };
                                if(success && angular.isFunction(success)){
                                    success.call(self,res);
                                }
                            }
                        }, error, options);
                    }
                }
            },
            location: function (success, error, options) {
                if(!this.isInit) this.init(success, error, options);
                success = success || this._success;
                error = error || this._error;
                options = options || this._options;
                if (!this._geolocation) {
                    if(error) error({message:'没有开启定位。'});
                    return;
                }

                this._geolocation.getCurrentPosition(success, error, options);
            },
            isWeixin:function(){
                var ua = window.navigator.userAgent.toLowerCase();

                if(ua.match(/MicroMessenger/i)=="micromessenger") {
                    return true;
                }
                return false;
            }
        });

        MicroEvent.mixin(HyGeolocationView);
        return HyGeolocationView;
    });
})();
/**
 * HyGdMapViewp - v1.0.0 - 2016-08-10
 * @author liukeyu
 * @ngdoc service
 * @name HyGdMapView
 * @description
 *   [ch]高德地图服务.[/en]
 */
(function() {
	'use strict';
	var module = null;
	try {
		module = angular.module('haiyiMobile');
	} catch (err) {
		module = angular.module('haiyiMobile', ['onsen']);
	}
    
    module.factory('HyGdMapView',['$onsen','HyGeolocationView','GPSTranslate','$rootScope',function($onsen,HyGeolocationView,GPSTranslate,$rootScope){
        var cacheLocation;
        var HyGdMapView = Class.extend({
            _ak:null,//地图秘钥 （广州充电桩 234ff739f7a8578b997bda504cd024ba）
            _defaultOptions:{
                level:11//地图级别
            },
            _defaultControls:[
                {name:'MapType',options:null}//地图类型
                ,{name:'Scale',options:null}//比例尺
                ,{name:'ToolBar',options:null}//缩放控件
                ,{name:'Geolocation',options:null}//定位
               
            ],

            /**
             * @param {Object} scope
             * @param {jqLite} element
             * @param {Object} attrs
             */
            init: function(scope, element,attrs) {
                this._element = element;
                this._attrs = attrs;
                this._scope = scope;
				this._isFromDetail = true;
                this.geolocationCenter = null;

                this.options ={};
                if (this._attrs.hyaLevel && parseInt(this._attrs.hyaLevel)>0){
                    this.options.level = this._attrs.hyaLevel;
                }
                this.options = angular.extend({}, this._defaultOptions, this.options);

                //获取要加载的控制器
                if (!this._scope.controls || !angular.isArray(this._scope.controls)){
                    this._scope.controls = this._defaultControls;
                }
                this._scope.$on('$destroy', this._destroy.bind(this));
                this._mapInit();
            },

            _mapInit:function(){
                this._scope._haiyiMap = this._getGaoDeBMap();
                var message =  '地圖加載中...';
                if(!this._scope._haiyiMap){
                    this._showMapLoadLabel(message);
                    return;
                }

                if(this.AMap) return;
                this.AMap = this._scope._haiyiMap;
                this._hideMapLoadLabel();
                var mapInitBack = function(map){
                    if(!map) return;
                    this.map = map;
                    this._addControls(this._scope.controls,function () {
                        if(this._scope.init)
                            this._scope.init({$event:this});
                    }.bind(this));

                };
                this.map = this._createMap(this.options,mapInitBack);
            },


            _showMapLoadLabel:function(message){
                if(!this._labelEle){
                    this._labelEle = angular.element('<div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"></div>');
                    this._element.parent().append(this._labelEle);
                }
                this._labelEle.html(message);
            },
            _hideMapLoadLabel:function(message){
                if(this._labelEle){
                    this._labelEle.remove();
                }
            },
            /**
             * 获取地图对象
             * @private
             */
            _getGaoDeBMap:function(){
                if(window.AMap){
                    return window.AMap;
                }
                var aKey = this._attrs.hyaAk || this._ak;//地图秘钥
                window._gdMapInit = function(){
                    this._addUiScript();
                    this._mapInit();
                }.bind(this);
                var script = document.createElement('script') ;
                script.type ='text/javascript' ;
                var src = 'http://webapi.amap.com/maps?v=1.4.8&key='+aKey;//
                //添加回调
                src +='&callback=_gdMapInit';
                script.src = src;//
                var head = document.getElementsByTagName('head').item(0);
                head.appendChild(script);


                //document.body.appendChild(script);
                return window.AMap;
            },
            _addUiScript:function(){
                var script = document.createElement('script') ;
                script.type ='text/javascript' ;
                var src = 'http://webapi.amap.com/ui/1.0/main.js?v=1.0.11';//
                script.src = src;//
                var head = document.getElementsByTagName('head').item(0);
                head.appendChild(script);
            },
            hideTraffic:function(){//隐藏路况
                if(this.trafficLayer){
                    this.trafficLayer.hide();
                }
            },
            showTraffic:function(){//显示路况
                if(null!=this.trafficLayer){
                    this.trafficLayer.show();
                }else{
                	//路况
	                this.trafficLayer = new AMap.TileLayer.Traffic({
	                    zIndex: 10
	                });
	                this.trafficLayer.setMap(map);
                }
            },
            /**
             * 创建地图
             * @param options
             * @private
             */
            _createMap:function(options,callback){
                var AMap = this._scope._haiyiMap;
                var id = this._element.attr('id') || 'hy-gd-map';
                id += '-'+new Date().valueOf();
                this._element.attr('id',id);
                var map = new AMap.Map(id,{
                    resizeEnable: true,
                    animateEnable:false,
                    zoom:11
                });// 创建地图实例
                //路况
                this.trafficLayer = new AMap.TileLayer.Traffic({
                    zIndex: 10
                });
                this.trafficLayer.setMap(map);
                this.trafficLayer.hide();//默认隐藏路况
				if(null==options.level||""==options.level){
					options.level = 11;
				}
                map.setZoom(options.level);
               //自定义地图样式
	           map.setMapStyle('amap://styles/f1289afeaf46883ce5aabf057d34aa42');
                var centerBack = function(center){
                    if (center.type=='point' && center.point){
                        map.setCenter(center.point);// 初始化地图，设置中心点坐标和地图级别
                    }else if (center.type=='city' && center.city) {
                        map.setCity(center.city);// 初始化地图，设置中心点坐标和地图级别
                    }
                    if (callback && angular.isFunction(callback)){
                        callback.call(this,map);
                    }
                }.bind(this);

                this._initMapCenter(options,centerBack);
                return map;
            },
            /**
             * 初始化用户中心
             * @private
             */
            _initMapCenter: function(options,callback){
                var centerStr = this._attrs.hyaCenter;
                var center = {};
                center.type = 'point';
                if (!centerStr){
                    if (callback && angular.isFunction(callback)){
                        callback.call(this, center);
                    }
                    return null;
                }
                centerStr = typeof centerStr === 'string' ? centerStr.trim() : centerStr;
                var centerArr = centerStr.split(',');
                if (!centerArr || centerArr.length!=2
                    || isNaN(parseFloat(centerArr[0]))
                    || isNaN(parseFloat(centerArr[1]))){
                    center.type = 'city';
                    center.city = centerStr;
                    if (callback && angular.isFunction(callback)){
                        callback.call(this,center);
                    }
                    return center;
                }
                center.type = 'point';
                center.longitude = parseFloat(centerArr[0]);
                center.latitude = parseFloat(centerArr[1]);
                center.point =this.getMapPoint({lat:center.latitude, lng:center.longitude});// 创建点坐标
                var centerType = this._attrs.hyaCenterType || 2; //2 高德坐标

                if (centerType==2 && callback && angular.isFunction(callback)){
                    callback.call(this,center);
                    return center;
                }
                if (!callback || !angular.isFunction(callback)){
                    return center;
                }
                this._translateLocation({lat:center.latitude,lng:center.longitude},function(point,status){
                    if(status==0) center.point =this.getMapPoint({lat:point.lat, lng:point.lng});// 创建点坐标
                    callback.call(this,center);
                }.bind(this),centerType,2);
                return center;
            },

            /**
             * 定位成功后操作
             * @param e
             * @private
             */
            _geoSuccess:function(e,toCenter,showPoint,gpsPoint){
                var position ={};// e;
                position.lng = e.coords.longitude;
                position.lat = e.coords.latitude;

                var accuracy = e.coords.accuracy;
                this._autoGeo =(this._autoGeo||toCenter)?true:false;

                var res = {};
                res.point = position;
                res.state = 1;
                res.addressComponent ={};
                //res.addressComponent.province = ;
                res.addressComponent.city = e.coords.city;
                res.addressComponent.address = e.coords.address;
                //res.addressComponent.district;
                //res.addressComponent.street;
                //res.addressComponent.streetNumber;
                var p = this.getMapPoint(position);
                cacheLocation = {};
                cacheLocation.type = 'point';
                cacheLocation.point = p;
                if (this._autoGeo){
                    this._setMapCenter(this.map,p,showPoint,accuracy);//自动定位（执行location()方法）
                    this._autoGeo = false;
                }
                res.gpsPoint = gpsPoint;
                this._scope.geolocation && this._scope.geolocation.call(this,{$event:res,$map:this});
            },
            /**
             * 定位失败操作
             * @param e
             * @private
             */
            _geoFail:function(e){
                e.point = null;
                this._scope.geolocation && this._scope.geolocation.call(this,{$event:e,$map:this});
            },
            /**
             * 定位控件
             * @param success
             * @param fail
             * @returns {*}
             * @private
             */
            _createGeolocationControl:function(success,fail,opts){
                if (!this._scope._haiyiMap){
                    return null;
                }
                var geoLocationIng = false;
                var geolocationControl = new HyGeolocationView(success,fail);
                var mapView = this;
                this._scope.geolocaScope = function($event){
                    if(geoLocationIng) return;
                    geoLocationIng = true;
                    var target = angular.element($event.currentTarget);
                    target.addClass('amap-locate-loading');
                    geolocationControl.location(function(e){
                        target.removeClass('amap-locate-loading');
                        geoLocationIng = false;
                        if(geolocationControl.type==='gaode'){//高德获取到高德坐标
                            var center  = e;// 创建点坐标
			                success.call(this,center,true,true,{});
                            return;
                        }
                        //其他获取到是GPS
                        var position ={};// e;
                        position.lng = e.coords.longitude;
                        position.lat = e.coords.latitude;
                        this._translateLocation(position,function(point){
                            var center  = {coords:{longitude:point.lng,latitude:point.lat}};// 创建点坐标
                            success.call(this,center,true,true,position);
                        }.bind(this),1,2);
                    }.bind(mapView),function(e){
                        target.removeClass('amap-locate-loading');
                        geoLocationIng = false;
                        //var point = this.map.getCenter();
                        //var center  = {coords:{longitude:point.lng,latitude:point.lat,accuracy:200}};// 创建点坐标
                        //success.call(this,center,true,true);
                        fail.call(this,e);
                    }.bind(mapView));
                };
                var html='<div class="amap-geolocation-con hy-amap-geolocation" style="position: absolute; z-index: 9999; left: 10px; bottom: 50px;" ng-click="geolocaScope($event);">' +
                            '<div class="amap-geo"></div>' +
                        '</div>';
                var geolocationEle = ons.$compile(html)(this._scope);
                var controlEle = this._element[0].querySelector('.amap-controls');
                angular.element(controlEle).append(geolocationEle);
                if(this._isFromDetail)
                	this.geolocationCtrl(geolocationEle);
                //var geolocation = new AMap.Geolocation(opts);
                //this.map.addControl(geolocation);
                //
                //AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                //AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
                return geolocationControl;
            },

            geolocationCtrl:function(geolocationEle){
                if(!geolocationEle){
                    var controlEle = this._element[0].querySelector('.hy-amap-geolocation');
                    if(controlEle){
                        geolocationEle = angular.element(controlEle);
                    }
                }
                if(!geolocationEle||!this._scope.geolocaScope) return;
                this._scope.geolocaScope({currentTarget:geolocationEle});
            },

			setFromDetail : function(data){
				this._isFromDetail=data;
			},
            /**
             * 改变地图中心点
             * @param point null：自动定位
             * @private
             */
            _setMapCenter : function(map,point,showPoint,accuracy){
                var AMap = this.AMap;
                var mapView = this;
                if(map && point){
                    map.setCenter(point);
                    if(!showPoint){
                        return;
                    }
                    this.map.setZoom(11);
                    if(accuracy){
                        if(this.accuracyCircle) this.accuracyCircle.setMap(null);//移除精度控件
                        this.accuracyCircle = new mapView.AMap.Circle({
                            center: point,
                            radius: accuracy,
                            strokeColor:'#2196F3',
                            strokeOpacity:0,
                            fillColor:'#2196F3',
                            fillOpacity:0.2
                        });
                        this.accuracyCircle.setMap(this.map);
                    }
                    if(this.centerMarker){
                        this.centerMarker.setPosition(point);
                        return;
                    }
                    this.centerMarker = new mapView.AMap.Marker({
                        icon: "http://webapi.amap.com/theme/v1.3/markers/n/loc.png",
                        position: point,
                        offset: {x: -12,y: -12}
                    });
                    this.centerMarker.setMap(this.map);
                    return;
                }
                if(this.geolocationControl) {//定位
                    this._autoGeo = true;
                    this.geolocationControl.location();
                }

            },

            /**
             * 坐标转换
             * @param points ：点集合
             * @param callback ：回调
             * @param type ：类型 1：原始坐标 2:高德 3：google坐标 5：百度坐标
             * @private
             */
            translateLocation : function(points,callback,fType,tType){
               this._translateLocation(points,callback,fType,tType);
            },
            /**
             * 坐标转换
             * @param points ：点集合
             * @param callback ：回调
             * @param type ：类型 1：原始坐标 2：高德 3：google坐标 5：百度坐标
             * @private
             */
            _translateLocation: function(points,callback,fType,tType){
                if (!points || !this._scope._haiyiMap){
                    return;
                }
                var pl = angular.isArray(points);//批量操作
                if(!pl){
                    var point = points;
                    points = [];
                    points.push(point);
                }

                fType = fType || 1;
                tType = tType || 2;
                //坐标转换完之后的回调函数
                var translateCallback = function (data){
                    if (!callback || !angular.isFunction(callback)) return;
                    var backData = null;
                    if(data.points) {
                        backData = pl?data.points:data.points[0];
                    }
                    callback.call(this,backData,data.status,data.info);
                };
                if(fType==tType) {
                    translateCallback.call(this,{points:points,status:0});
                }

                if(tType==2){//转高德坐标

                    var AMap = this.AMap;
                    var lnglats = [];
                    for (var i=0;i<points.length;i++){
                        var p = this.getMapPoint(points[i]);
                        if(p!=null)
                            lnglats.push(p);
                    }
                    var type='gps';
                    if(fType==5) type = 'baidu';
                    AMap.convertFrom(lnglats,type,function(status,result){
                        translateCallback.call(this,{points:result.locations,status:result.info=='ok'?0:1,info:result.info});
                    });

                }
                if(fType==2&&tType==1){//高德转原始坐标
                    var gdPoints = [];
                    for (var i=0;i<points.length;i++){
                        var p = points[i];
                        var bp = new GPSTranslate().gcj_decrypt(p.lat, p.lng);
                        gdPoints.push({lat:bp.lat,lng:bp.lon});
                    }
                    translateCallback.call(this,{points:gdPoints,status:0});
                }


            },

            _isControl:function(AMap,name){
                if (!AMap) {
                    return false;
                }
                return AMap[name];
            },

            _addControls: function(controls,callback){
                var AMap = this._scope._haiyiMap;
                if (!this.map || !AMap) {
                    return;
                }
                var controllNames = [];
                for (var i=controls.length-1;i>=0;i--){
                    var item = controls[i];
                    controllNames.push('AMap.'+item.name);
                    //if (item.name !='Geolocation'){
                    //    controllNames.push('AMap.'+item.name);
                    //}
                }

                if(controllNames.length<=0) return;
                AMap.plugin(controllNames,function(){
                    for(var i=controls.length-1;i>=0;i--){
                        var item = controls[i];
                        var control = this._createControl(AMap,item);
                        if(control) this.map.addControl(control);
                    }
                    if(callback&&angular.isFunction(callback)){
                        callback.call(this);
                    }
                }.bind(this));
            },

            _createControlByName : function(AMap,name,opts){
                if (!AMap) {
                    return null;
                }
                opts = angular.extend({},opts);
                if(name == 'Geolocation'){
                    this.geoSuccess = this._geoSuccess.bind(this);
                    this.geoFail = this._geoFail.bind(this);
                    var geo = this._createGeolocationControl(this.geoSuccess,this.geoFail,opts);
                    this.geolocationControl = geo;
                    return null;
                }
                var control = this['_create'+name];
                if (control && angular.isFunction(control)){
                    return control.call(this,opts);
                }
                control = AMap[name];
                if (control){
                    return new control(opts);
                }
            },

            /**
             *  创建自定义控件并返回实例
             * @param HMap
             * @returns {null}
             * @private
             */
            _createControl: function(AMap,control){
                AMap = AMap || this._scope._haiyiMap;
                if (!AMap || !control || !control.name) {
                    return null;
                }
                var name = control.name;
                if (this._isControl(AMap,name)) {
                    return this._createControlByName(AMap,name,control.options);
                }
                return null;
            },

            /**
             * 获取地图坐标点
             * @param point
             */
            getMapPoint:function(point){
                var AMap = this._scope._haiyiMap;
                if (!AMap || !point) {
                    return null;
                }
                if(!(point instanceof AMap.LngLat)){
                    point = new AMap.LngLat(point.lng,point.lat);
                }

                return point;
            },
            /**
             * 根据坐标查询地址
             * @param point
             * @param type:1：原始坐标 2：高德 3：google坐标 5：百度坐标 默认2：高德
             * @param callback 回调 参数
             *          status: 结果状态码，“complete；error；no_data”
             *                  complete：有结果
             *                  error：错误
             *                  no_data：没数据
             *          info: status!=“complete”时错误消息
             *          data:当status为complete时，data为ReGeocode
             *              ReGeocode:
             *                  addressComponent:AddressComponent地址组成元素
             *                  formattedAddress:String格式化地址
             *                      规则：地址信息=基本行政区信息+具体信息；
             *                      基本行政信息=省+市+区+乡镇
             *                      当给定坐标为poi时直接返回；非poi时，取离给定坐标最近poi返回
             *                  roads:Array.<Road>道路信息列表
             *                  crosses:Array.<Cross>道路路口列表
             *                  pois:Array.<ReGeocodePoi>兴趣点列表，包含兴趣点基本信息
             */
            getAddressByPoint:function(point,type,callback){
                type = type || 2;
                if(!this.AMap){
                    if(callback&&angular.isFunction(callback))
                        callback.call(this,{status:'error',info:'高德地图控件未初始化！'});
                    return;
                }
                var success = function(p,st,info){

                    if(st !=0 && callback&&angular.isFunction(callback)){
                        callback.call(this,{status:'error',info:info});
                        return;
                    }
                    var geocoder = new this.AMap.Geocoder();
                    var lnglatXY = [p.lng, p.lat];
                    geocoder.getAddress(lnglatXY,function(status,result){
                        result = result || {};
                        if(callback&&angular.isFunction(callback)){
                            callback.call(this,{status:status
                                ,info:result.info
                                ,data:result.regeocode});
                        }
                    });
                }.bind(this);
                if (type!=2){
                    this._translateLocation(point,function(p,status,info){
                        success.call(this,p,status,info);
                    }.bind(this),type,2);
                    return;
                }
                success.call(this,point,0,'ok');
            },

            /**
             * 根据地址查询经纬度
             * @param address：地址
             * @param callback 回调 参数
             *          status: 结果状态码，“complete；error；no_data”
             *                  complete：有结果
             *                  error：错误
             *                  no_data：没数据
             *          info: status!=“complete”时错误消息
             *          number:地理编码结果数目，仅地理编码返回
             *          data:当status为complete时，data为Array.<Geocode>
             *              ReGeocode:
             *                  addressComponent:AddressComponent地址组成元素
             *                  formattedAddress:String格式化地址
             *                      规则：地址信息=基本行政区信息+具体信息；
             *                      基本行政信息=省+市+区+乡镇
             *                      当给定坐标为poi时直接返回；非poi时，取离给定坐标最近poi返回
             *                  location:LngLat坐标
             *                  adcode:String区域编码
             *                  level:String给定地址匹配级别，返回匹配最详细级别
             */
            getPointByAddress:function(address,callback){
                if(!this.AMap){
                    if(callback&&angular.isFunction(callback))
                        callback.call(this,{status:'error',info:'高德地图控件未初始化！'});
                    return;
                }
                var geocoder = new this.AMap.Geocoder();
                geocoder.getLocation(address,function(status,result){
                    if(callback&&angular.isFunction(callback)){
                        result = result || {};
                        callback.call(this,{status:status
                            ,info:result.info
                            ,data:result.geocodes
                            ,number:result.resultNum});
                    }
                });
            },

            /**
             * Destroy.
             */
            destroy: function() {
                this._scope.$destroy();
            },

            _destroy: function() {
                this._scope._haiyiMap = null;

                this._scope = this._attrs = this._element = this.map = this.geolocationControl = null;
            }
        });

        MicroEvent.mixin(HyGdMapView);
        return HyGdMapView;
    }]);

    /**
     * hy-gd-map - v1.0.0 - 2016-08-10
     * @author liukeyu
     * @ngdoc directive
     * @name hy-gd-map
     * @description
     *   [ch]高德地图.[/en]
     * @example
     * <hy-gd-map>
     * </hy-gd-map>
     */
    module.directive('hyGdMap', ['HyGdMapView','$onsen',function(HyGdMapView,$onsen){
        return {
            restrict: 'EA',
            scope:{
                controls:'=hyaControls',
                geolocation:'&hyaGeolocation',
                init:'&hyaInit'
            },
            compile: function(element,attrs) {
                element.addClass('hyc-gd-map');
                return function(scope,element,attrs) {
                    var hyMapView = new HyGdMapView(scope,element,attrs);
                    $onsen.declareVarAttribute(attrs, hyMapView);
                };
            }
        };
    }]);
})();