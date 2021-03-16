/**
 * Created by keyu on 2017/8/29.
 * 欢迎页面（初始化）控制器
 */
app.controller('MoreCtrl', ['$scope', 'MenuService','ToolService',
    function ($scope, MenuService,ToolService) {

        // 获取菜单
        var menuGroupList = MenuService.getMenuGroup();

        //每四个一组组合菜单
        $scope.menuGroupList = (function(list,col){
            var groupFun = function(menus,col){
                var res = [];
                col = col || 4;
                for(var i=0;i<menus.length;i=i+col){
                    var itemList = menus.slice(i,i+col)||[];
                    while(itemList.length<col){
                        itemList.push({});
                    }
                    res.push(itemList);
                }
                return res;
            };
            var groupList = [];
            for(var i=0;i<list.length;i++){
                var item = {};
                var group = list[i];
                item.groupName = group.groupName;
                item.menuRowList = groupFun(group.menuList,col);
                groupList.push(item);
            }
            return groupList;

        })(menuGroupList,4);

        // 菜单图标样式
        $scope.getStyle = function (bgColor) {
            return {
                'box-shadow': ToolService.hex2Rgb(bgColor,'0.5') +' 0px 0px 2px 2px',
                'background-color' : bgColor

            };
        };

        /**
         * 点击菜单的处理事件
         * @param menuItem
         */
        $scope.selectMenu = function (menuItem) {
            if(!menuItem||!menuItem.menuUrl) return;
            mainNavi.pushPage(menuItem.menuUrl, {
                cancelIfRunning: true,
                menuItem: menuItem
            });
        };
        $scope.shezhi = function(){
            mainNavi.pushPage(
                'pages/common/shezhi/shezhi.html',
                {cancelIfRunning:true}
            );
        }
    }]);