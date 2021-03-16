/**
 * Version:1.0.0
 * Author:高飞
 * Date:2017/9/4
 * 通用待办详情
 */
app.controller('dbDetialCtrl', ['$scope', 'TaskService', function ($scope, TaskService) {
    /*---------- 变量及属性定义 ----------*/
    // 获取上个页面参数
    $scope.task = mainNavi.getCurrentPage().options.task;
    // 定义工单详情列表
    $scope.taskStateList = [];

    /*---------- 页面上的控制器方法 ----------*/
    /**
     * 查询工单办理情况
     */
    $scope.query = function () {
        $scope.init = false;
        $scope.error = false;
        TaskService.getTaskStateList($scope.task).then(function (data) {
            $scope.taskStateList.length = 0;
            $scope.taskStateList = data;
            $scope.init = true;
        }, function () {
            $scope.error = true;
        })
    };

    /*---------- 控制器初始化操作 ----------*/

    //查询待办办理情况
    $scope.query();
}]);