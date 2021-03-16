/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/4
 * 通用待办
 */
app.controller('DblbCtrl', ['$scope', '$appConfig', 'MenuService', 'TaskService',
    function ($scope, $appConfig, MenuService, TaskService) {
        // 获取上个页面数据
        var menuItem = mainNavi.getCurrentPage().options.menuItem;

        var taskAllList = [];
        // 标题
        $scope.title = menuItem.menuName;
        //待办任务列表
        $scope.taskList = [];
        // 搜索条件
        $scope.searchparam = '';
        // 懒加载配置
        $scope.dbDelegate = {
            configureItemScope: function (index, itemScope) {
                itemScope.item = $scope.taskList[index];
            },
            calculateItemHeight: function (index) {
                return 175;
            },
            countItems: function () {
              return $scope.taskList.length;;
            },
            destroyItemScope: function (index, scope) {

            }
        };

        /*---------- 控制器的页面功能 ----------*/

        /**
         * 查询待办列表
         */
        $scope.queryTaskList = function () {
            var data=[];
            $scope.isTaskListInit = false;
            $scope.getTaskError = false;
            TaskService.getTaskList(menuItem.bzhjh.join(',')).then(function (list) {
                if(menuItem.bzhjh =="7068"){
                    for( var i = 0; i<list.length;i++){
                        if(menuItem.menuName == list[i].hjmc){
                            data.push(list[i]);
                        }
                    }
                    $scope.refashTaskList(data);
                }else{
                    $scope.refashTaskList(list);
                }
            }, function () {
                $scope.getTaskError = true;
            });
        };
        /**
         * 工单详情
         * @param task
         */
        $scope.gdclmx = function (task) {
            mainNavi.pushPage('pages/common/dblb/dbDetial.html', {task: task, cancelIfRunning: true});
        };
        /**
         * 工单办理
         * @param task
         */
        $scope.ywcl = function (task) {
            var url = MenuService.getTaskUrl(task);
            mainNavi.pushPage(url, {task: task, cancelIfRunning: true});
        };
        //退签
        $scope.tq = function(item){
            hyMui.confirm({
                title: '确认',
                message: '确定要退签吗？',
                buttonLabels: ['否', '是'],
                callback: function (i) {
                    if (i !== 1) {
                        return;
                    }
                    hyMui.loaderShow();
                    TaskService.tqTask(item).then(function (data) {
                        if ((data.replyCode === 'OK')) {
                            hyMui.alert('退签成功');
                            $scope.load(function () {
                            });
                        } else {
                            hyMui.alert('退签失败');
                        }
                        hyMui.loaderHide();
                    }, function () {
                        hyMui.alert('退签失败');
                        hyMui.loaderHide();
                    });
                }
            });
        };
        /**
         * 刷新待办列表及状态
         */
        $scope.refashTaskList = function (list) {

            $scope.isTaskListInit = TaskService.isTaskListInit;
            taskAllList = list;
            $scope.taskList = list;
            $scope.getTaskError = false;
        };
        /**
         * 检索方法
         */
        $scope.search = function () {
            $scope.taskList = js(taskAllList);
        };

        // 检索
        function js(list) {
            var res = [];
            if ($scope.searchparam === '') {
                return list;
            }
            for (var i = 0; i < list.length; i++) {
                var dbgd = list[i];
                if (dbgd.gzdbh.indexOf($scope.searchparam) >= 0 ||
                    dbgd.ywzl.indexOf($scope.searchparam) >= 0) {
                    res.push(dbgd);
                }
            }
            return res;
        }

        /**
         * 监听任务变化
         */
        $scope.$on('TASK_CHANGE', function () {
            $scope.load(function () {
            });
        });
        /**
        // * 监听勘查派工任务变化
        // */
        //$scope.$on('CKPG_CHANGE', function () {
        //    $scope.load(function () {
        //    });
        //});
        /**
         * 下拉刷新的处理方法
         * @param $done
         */
        $scope.load = function ($done) {
            var Data=[];
            $scope.searchparam = '';
            TaskService.getTaskList(menuItem.bzhjh.join(',')).then(function (list) {
                if(menuItem.bzhjh =="7068"){
                    for( var i = 0; i<list.length;i++){
                        if(menuItem.menuName == list[i].hjmc){
                            Data.push(list[i]);
                        }
                    }
                    $scope.refashTaskList(Data);
                }else{
                    $scope.refashTaskList(list);
                }
                $scope.dbDelegate.render($done);
            }, function () {
                $done();
            });
        };
        /*---------- 进行控制器的初始化操作 ----------*/
        //执行待办任务的查询操作
        $scope.queryTaskList();

    }]);