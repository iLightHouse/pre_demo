/**
 * Created by ym on 2017/2/28.
 */

app.factory('MenuHzService', ['HZConstant', '$hyUtil', '$appConfig', '$rootScope',
    function (HZConstant, $hyUtil, $appConfig, $rootScope) {
        var moreMenu = {
            menuOrder: 0,  //菜单排序号
            menuName: "更多",   //菜单的名称
            menuUrl: "pages/common/more/more.html", //菜单的链接地址
            menuImgUrl: "img/menu/gengduo.png",    //菜单的LOGO地址
            SFGD: 0
        };
        var allMenuList = HZConstant.MENU_LIST.sort(function (a, b) {
            return a.menuOrder - b.menuOrder;
        });
        var menuList = HZConstant.MENU_LIST.filter(function (menu) {
            return !menu.notShow;
        }).sort(function (a, b) {
            return a.menuOrder - b.menuOrder;
        });
        var groupList = HZConstant.GROUP_LIST;
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
                    list.push(moreMenu);
                }
                return list;
            },
            /**
             * 获取菜单并以groupId分组
             */
            getMenuGroup: function () {
                var list = [];
                var groupIdList = [];
                for (var i = 0; i < groupList.length; i++) {
                    var group = groupList[i];
                    var groupId = group.groupId;
                    groupIdList.push(groupId);
                    group.menuList = menuList.filter(function (item) {
                        return item.groupId == groupId;
                    }) || [];
                    list.push(group);
                }
                // var other = {
                //     groupId: 0,
                //     groupName: '其他'
                // };
                // other.menuList = menuList.filter(function (item) {
                //     return groupIdList.indexOf(item.groupId) <= 0;
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
                this._broadMenuChange();
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
            _broadMenuChange: function () {
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
                for (var i = 0; i < allMenuList.length; i++) {
                    var menu = allMenuList[i];
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
                for (var i = 0; i < allMenuList.length; i++) {
                    var menu = allMenuList[i];
                    if (menu.SFGD != 1) continue;
                    list.push.apply(list, menu.bzhjh);
                }
                return list;
            },
            /**
             * 获取判断工单办理数据
             */
            checkWorkOrderData: null,
            getCheckWorkOrderData: function () {
                if (this.checkWorkOrderData) {
                    return this.checkWorkOrderData;
                }
                var self = this;
                this.checkWorkOrderData = {};
                for (var i = 0; i < allMenuList.length; i++) {
                    var menu = allMenuList[i];
                    if (menu.SFGD != 1) continue;
                    if (menu.ywzldm && menu.ywzldm.length > 0) {
                        menu.bzhjh.forEach(function (value) {
                            self.checkWorkOrderData[value] = self.checkWorkOrderData[value] || [];
                            menu.ywzldm.forEach(function (item) {
                                if (self.checkWorkOrderData[value].indexOf(item) <= -1) {
                                    self.checkWorkOrderData[value].push(item);
                                }
                            });
                        });
                    } else if (menu.ywzldm) {
                        for (var key in menu.ywzldm) {
                            self.checkWorkOrderData[key] = self.checkWorkOrderData[key] || [];
                            if (self.checkWorkOrderData[key] && self.checkWorkOrderData[key].length >= 0) {
                                menu.ywzldm[key].forEach(function (value) {
                                    if (self.checkWorkOrderData[key].indexOf(value) <= -1) {
                                        self.checkWorkOrderData[key].push(value);
                                    }
                                });
                            }
                        }
                    } else {
                        menu.bzhjh.forEach(function (value) {
                            self.checkWorkOrderData[value] = 1;
                        });
                    }
                }
                return this.checkWorkOrderData;
            },
            /**
             * 获取所有工单菜单
             * @returns {Array}
             */
            getAllGdMenu: function () {
                var list = allMenuList.filter(function (menu) {
                    return menu.SFGD == 1 && menu.bzhjh && menu.bzhjh.length > 0;
                });
                return list;
            },
            getCommonMenu:function () {
                var menuList = $hyUtil.getLocal('MENU_COMMON_' + $appConfig.userInfo.RYBS);
                if(!menuList) menuList = [];
                return menuList;
            },
            addCommonMenu:function (menu) {
                if(!menu) return;
                var menuList = $hyUtil.getLocal('MENU_COMMON_' + $appConfig.userInfo.RYBS);
                if(!menuList) menuList = [];
                var index = -1;
                for(var i=0;i<menuList.length;i++){
                    var item = menuList[i];
                    if(item.menuId === menu.menuId){
                        index = i;
                        break;
                    }
                }
                if(index>=0){
                    menuList.splice(index,1);
                }
                menuList.unshift(menu);
                menuList = menuList.slice(0,10);
                $hyUtil.saveLocal('MENU_COMMON_' + $appConfig.userInfo.RYBS,menuList);
            }
        };
    }]);
