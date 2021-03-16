app.controller('networkTestCtrl', ['$scope', 'TaskService', '$appConfig',
    function ($scope, TaskService, $appConfig) {
        $scope.list = [
            {
                name: '百度',
                url: 'https://www.baidu.com'
            },
            {
                name: '腾讯',
                url: 'https://www.qq.com/'
            },
            {
                name: '新浪',
                url: 'https://www.sina.com.cn/'
            },
            {
                name: '应用平台',
                url: 'https://app.gd.csg.cn:7553/gate/proxy/'
            },
            {
                name: '移动营销',
                url: 'https://app.gd.csg.cn:7553/gate/proxy/NWPri/serviceInvoke.do'
            }
        ];

        //ajax 对象
        function ajaxObject() {
            var xmlHttp;
            try {
                // Firefox, Opera 8.0+, Safari
                xmlHttp = new XMLHttpRequest();
            } catch (e) {
                // Internet Explorer
                try {
                    xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {
                        alert("您的浏览器不支持AJAX！");
                        return false;
                    }
                }
            }
            return xmlHttp;
        }

        // ajax post请求：
        function ajaxPost(item) {
            var ajax = ajaxObject();
            ajax.open("get", item.url, true);
            ajax.setRequestHeader("Content-Type", "application/json;charset=utf-8");
            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4) {
                    item.stateCode = ajax.status;
                    item.status = '成功';
                    $scope.$evalAsync();
                }
            };
            ajax.onerror = function () {
                item.stateCode = ajax.status;
                item.status = '失败';
                $scope.$evalAsync();
            };
            ajax.send(null);
        }

        $scope.retest = function () {
            $scope.list.forEach(function (item) {
                item.stateCode = 0;
                item.status = '请稍后...';
                ajaxPost(item);
            });
        };
        $scope.retest();
    }]);