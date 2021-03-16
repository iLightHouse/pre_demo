/**
 * Created by ym on 2017/2/28.
 */

app.factory('MenuService', ['TFConstant', '$hyUtil', '$appConfig', '$rootScope',
    function (TFConstant, $hyUtil, $appConfig, $rootScope) {
        var moreMenu = {
            menuOrder: 0,  //菜单排序号
            menuName: "更多",   //菜单的名称
            menuUrl: "pages/common/more/more.html", //菜单的链接地址
            menuImgUrl: "img/menu/gengduo.png",    //菜单的LOGO地址
            bgColor: '#fcd37d',
            SFGD: 0
        };
        var menuList = TFConstant.MENU_LIST.filter(function (item) {
            if (!item.targetProj) return false;
            if (item.hidedqbm && $appConfig.userInfo) {
                return item.hidedqbm.indexOf($appConfig.userInfo.DQBM) === -1;
            }
            if (item.dqbm && $appConfig.userInfo) {
                return item.dqbm.indexOf($appConfig.userInfo.DQBM) !== -1;
            }
        }).sort(function (a, b) {
            return a.menuOrder - b.menuOrder;
        });
        var groupList = TFConstant.GROUP_LIST.filter(function (item) {
            if (!item.targetProj) return false;
            if (item.dqbm && item.dqbm === $appConfig.userInfo.DQBM) return true;
        });
        return {
            /**
             * 获取菜单列表
             * @param type 1：首页菜单 2：全部菜单 （默认1）
             * @returns {Array.<T>}
             */
            getMenu: function (type) {
                var list = menuList;
                type = type || 1;
                if (type != 1) return list;
                if (menuList.length > 7) {
                    list = menuList.slice(0, 7);
                    // 设置菜单背景色
                    for (var l = 0; l < list.length; l++) {
                        var groupOfMenu = groupList.filter(function (item) {
                            return item.groupId == list[l].groupId;
                        });
                        list[l].bgColor = groupOfMenu[0].bgColor;
                    }
                    list.push(moreMenu);
                }
                return list;
            },
            /**
             * 获取菜单并以groupId分组
             */
            getMenuGroup: function () {
                var list = [];
                for (var i = 0; i < groupList.length; i++) {
                    var group = groupList[i];
                    var groupId = group.groupId;
                    group.menuList = menuList.filter(function (item) {
                        return item.groupId == groupId;
                    }) || [];
                    // 设置菜单背景色
                    for (var l = 0; l < group.menuList.length; l++) {
                        // 如果菜单没有单独设置，则取菜单组的背景色
                        if (!group.menuList[l].bgColor) {
                            group.menuList[l].bgColor = group.bgColor;
                        }
                    }
                    list.push(group);
                }
                // var other = {
                //     groupId:0,
                //     groupName:'其他'
                // };
                // other.menuList = menuList.filter(function(item){
                //     return groupIdList.indexOf(item.groupId)<0;
                // }) || [];
                // list.push(other);

                return list;
            },
            /**
             * 保存首页图标到本地
             * @param  menuList
             */
            saveMenuByLocal: function (menuList) {
                var list = menuList;
                list.push(moreMenu);
                $hyUtil.saveLocal('MENU' + $appConfig.userInfo.RYBS, list);
                this._broadmenuChange();
            },
            /**
             * 得到首页图标到本地
             * @returns {*}
             */
            getMenuByLocal: function () {
                return $hyUtil.getLocal('MENU' + $appConfig.userInfo.RYBS);
            },
            /**
             * 删除首页图标到本地
             */
            removeMenuByLocal: function () {
                $hyUtil.removeLocal('MENU' + $appConfig.userInfo.RYBS);
            },
            /**
             * 发送任务列表变化的广播通知
             */
            _broadmenuChange: function () {
                $rootScope.$broadcast("menuList");
            },
            /**
             * 获取工单办理页面
             * @param task
             * @returns {string}
             */
            getTaskUrl: function (task) {
                //默认详情页面
                var pageUrl = 'pages/common/dblb/dbDetial.html';
                for (var i = 0; i < menuList.length; i++) {
                    var menu = menuList[i];
                    if (menu.SFGD != 1) continue;
                    if (menu.bzhjh.indexOf(task.bzhjh) < 0) {
                        continue;
                    }
                    if (angular.isObject(menu.workUrl) && menu.workUrl[task.bzhjh]) {
                        pageUrl = menu.workUrl[task.bzhjh];
                    } else {
                        pageUrl = menu.workUrl || pageUrl;
                    }
                }
                return pageUrl;
            },
            /**
             * 获取所有标准环节号
             * @returns {Array}
             */
            getAllBzhjh: function () {
                var list = [];
                for (var i = 0; i < menuList.length; i++) {
                    var menu = menuList[i];
                    if (menu.SFGD != 1) continue;
                    list.push.apply(list, menu.bzhjh);
                }
                return list;
            },

            /**
             * 获取所有工单菜单
             * @returns {Array}
             */
            getAllGdMenu: function () {
                return menuList.filter(function (menu) {
                    return menu.SFGD == 1 && menu.bzhjh && menu.bzhjh.length > 0;
                });
            },
            /**
             * 通过菜单ID查找菜单信息
             * @param menuId
             */
            getMenuByMenuId: function (menuId) {
                return menuList.filter(function (menuItem) {
                    return menuItem.menuId == menuId;
                });
            }
        };
    }]);
