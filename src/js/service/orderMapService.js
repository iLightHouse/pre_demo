/**
 * Created by lxj on 2017/09/13.
 * 供電點位置
 */

app.factory('OrderMapService', ['dxxxService', '$q',
    function (dxxxService, $q) {

        var service = {};

        /**
         * 跳轉供電點位置地圖
         * @param position
         * @param flag
         */
        service.toMapLocation = function (position, flag) {
            if (!position.jd || !position.wd || position.jd == '-1' || position.wd == '-1' || position.jd == '-2' || position.wd == '-2') {
                var param = {
                    "voList": [
                        {
                            "gisequityp": position.lowvoltequityp,
                            "gisid": position.supppntno,
                            "lati": 0,
                            "lon": 0
                        }
                    ]
                };
                hyMui.loaderShow();
                dxxxService.queryGddPosition(param).then(function (res) {
                    hyMui.loaderHide();
                    position.jd = res.lon || '';
                    position.wd = res.lati || '';
                    if (!position.jd || !position.wd || position.jd == '-1' || position.wd == '-1' || position.jd == '-2' || position.wd == '-2') {
                        hyMui.alert('經緯度不存在，無法查看');
                        return;
                    }
                    mainNavi.pushPage("pages/cemydzy/dtxx/cem_dtjk.html", {
                        position: position,
                        flag: flag,
                        cancelIfRunning: true
                    })
                }, function () {
                    hyMui.loaderHide();
                });
            } else {
                mainNavi.pushPage("pages/cemydzy/dtxx/cem_dtjk.html", {
                    position: position,
                    flag: flag,
                    cancelIfRunning: true
                })
            }
        };

        return service;
    }
]);
