/**
 * Created by keyu on 2017/8/31.
 * 下拉树指令
 */

/**
 * 下拉树弹框模板。
 */
(function (module) {
    try {
        module = angular.module('templates-main');
    } catch (err) {
        module = angular.module('templates-main', []);
    }
    module.run(['$templateCache', function ($templateCache) {
        'use strict';
        $templateCache.put('templates/hy_drop_tree_dialog.tpl',
            '<ons-dialog cancelable class="drop-dialog drop-tree-dialog">\
                <div class="tree-group hy-layout-column" id="tree_group">\
                    <div class="tree-close-btn" ng-click="close()">\
                        <i class="fa fa-times-circle-o"></i>\
                    </div>\
                    <div id="tree_root" class="tree-group-root">\
                    </div>\
                    <div id="tree_selected_body" class="tree-selected-body">\
                        <div class="tree-selected-content" ng-show="!config.hideBody">\
                            <div class="tree-selected-item" ng-show="selectedList.length>0" ng-repeat="item in selectedList">\
                                <span>{{showSelectVal(item);}}</span>\
                                <i class="fa fa-times" ng-click="removeSelectItem(item)"></i>\
                            </div>\
                            <div class="hy-layout-row hy-layout-align-center-center" style="width: 100%;padding: 5px;"\
                                ng-show="selectedList.length<=0">\
                                <span>未選擇任何數據</span>\
                            </div>\
                        </div>\
                        <div class="tree-selected-btn hy-layout-row hy-layout-align-center-center"\
                            ng-click="toggitSelectBody()">\
                            <i class="fa" \
                                ng-class="{\'fa-angle-up\':!config.hideBody,\'fa-angle-down\':config.hideBody}" ></i>\
                        </div>\
                    </div>\
                    <div class="tree-group-tree" id="tree_group_tree">\
                        <div class="tree-group-body" id="tree_group_body">\
                        </div>\
                    </div>\
                    <hy-button class="tree-submit-button" ng-click="selectedTreeItems()">\
                        <i class="fa fa-check-square-o"></i>\
                    </hy-button>\
                </div>\
                <div class="hy-layout-column hy-layout-align-center-center" \
                    style="position: absolute;top: 0;width: 100%;height: 100%;z-index: 9;"\
                    ng-show="loading">\
                    <hy-progress-circular hy-mode="indecterminate"></hy-progress-circular>\
                    <div style="color: #4b4b4b;font-size: 14px;margin-top: 10px">數據加載中...</div>\
                </div>\
            </ons-dialog>' +
            '');
    }]);
})();
/**
 * 下拉树服务。
 */
(function () {
    'use strict';
    var module = null;
    try {
        module = angular.module('haiyiMobile');
    } catch (err) {
        module = angular.module('haiyiMobile', ['onsen']);
    }
    module.factory('HyDropTreeService', ['$onsen', '$q', '$appConfig', '$compile',
        function ($onsen, $q, $appConfig, $compile) {
            var HyDropTreeService = Class.extend({
                treeId: '',
                maxCol: 1,
                doCache: true,
                canSelectMore: false,
                canSelectParent: false,
                selected: [],
                selectedItems: [],//选中各节点链条
                init: function (scope, element, attrs, ctrl) {
                    this._scope = scope;
                    this._element = element;
                    this._attrs = attrs;
                    this._ctrl = ctrl;
                    this._scope.icon = this._scope.icon || 'fa-angle-down';
                    this._scope.title = this._attrs.title || '請選擇';
                    this._scope.placeholder = this._attrs.placeholder || '------';
                    this._scope.selectedList = [];
                    this._scope.config = {hideBody: true};
                    this.disabled = false;
                    if (this._attrs.hasOwnProperty('disabled') && this._attrs.disabled) {
                        this.setDisabled(true);
                    }
                    this.canSelectMore = !this._attrs.hyaSelectMore || this._attrs.hyaSelectMore == 'false' ? false : true;
                    this.canSelectParent = !this._attrs.hyaSelectParent || this._attrs.hyaSelectParent == 'false' ? false : true;
                    this.treeId = this._attrs.treeId;
                    this.doCache = this._attrs.hyaCache && this._attrs.hyaCache == 'false' ? false : true;
                    this.doCache = (this.doCache && this.treeId);
                    this._scope.showDialog = this.showDialog.bind(this);
                    this._scope.close = this.closeDialog.bind(this);
                    this._scope.selectedTreeItems = this._selectedTreeItems.bind(this);
                    this._scope.hasSelectedItem = this._hasSelectedItem.bind(this);
                    this._scope.$on('$destroy', this._destroy.bind(this));
                    this._ctrl.$render = function () {
                        this.selectedItems = this._getSelectItemsLink();
                        var self = this;
                        setTimeout(function () {
                            self._querySelector('.droplist-title', self._element).html(self._getSelectedLabel());
                        }, 100);
                    }.bind(this);
                },
                /**
                 * 初始化选中数据
                 */
                initVal: function () {
                    this.selectedItems = this._getSelectItemsLink();
                    var key = this._attrs.hyaCodeKey || 'code';
                    var labelKey = this._attrs.hyaLabelKey || 'label';
                    var self = this;
                    this._getRootData().then(function (root) {
                        root = root || {};
                        var level = 0;
                        var code = root[key] || 0;
                        root[labelKey] = root[labelKey] || '下拉树';
                        root.level = level;
                        //设置跟节点值
                        self._querySelector('#tree_root').html(root[labelKey]);
                        var rootChild = self._getItemChilds(code, level);
                        if (rootChild && rootChild.length > 0) {
                            root.childrenList = rootChild;
                            self._addTreeItems(level + 1, rootChild, root);
                            return;
                        }
                        self._scope.getTreeData({
                            $level: level + 1,
                            $parent: root,
                            $callback: function (data) {
                                rootChild = data || [];
                                self._setItemChilds(code, level, rootChild);
                                root.childrenList = rootChild;
                                self._addTreeItems(level + 1, rootChild, root);
                            }
                        });
                    }, function () {
                        hyMui.toast({message: '跟节点获取失败！'});
                    });
                },
                /**
                 * 获取跟节点对象
                 * @returns {*}
                 * @private
                 */
                _getRootData: function () {
                    var deferred = $q.defer();
                    var self = this;
                    var root = self._getCache('root');
                    if (self.doCache && root) {
                        deferred.resolve(root);
                    } else {
                        self._scope.loading = true;
                        self._scope.getTreeData({
                            $level: 0,
                            $data: null,
                            $callback: function (data) {
                                self._scope.loading = false;
                                self._scope.$evalAsync();
                                self._setCache('root', data);
                                self.setAllDataList(!data ? [] : [data]);
                                deferred.resolve(data);
                            }.bind(this)
                        });
                    }
                    return deferred.promise;
                },
                _querySelector: function (str, element) {
                    element = element || this._scope.dialog._dialog;
                    var ele = element[0].querySelector(str);
                    if (!ele) return null;
                    return angular.element(ele);
                },
                /**
                 * 递归增加树的叶子节点
                 */
                _addTreeItems: function (level, dataList) {
                    if (!dataList || dataList.length <= 0) {
                        return;
                    }
                    var key = this._attrs.hyaCodeKey || 'code';
                    var labelKey = this._attrs.hyaLabelKey || 'label';
                    var itemId = 'tree_list_' + level;
                    var treeItem = this._querySelector('#' + itemId);
                    if (!treeItem) {
                        treeItem = this._addTreeItemGroup(level);
                        if (!treeItem) return;
                    }
                    if (this.maxCol < level) this.maxCol = level;

                    treeItem.html('');
                    var self = this;
                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i];
                        item.level = level;
                        var code = item[key];
                        var label = item[labelKey];
                        var html = '<div class="tree-list-item" ' +
                            //'ng-class="{\'active\':hasSelectedItem(\''+code+'\',1)}" ' +
                            'id="treeItem' + code + '"></div>';
                        var ele = angular.element(html);
                        var checkEle = null;
                        var labelEle = null;
                        if (!this.canSelectParent || item.notSelect) {
                            ele.html(label);
                            labelEle = ele;
                        } else {
                            var checkEleHtml = '<div class="tree-list-item-check" ' +
                                //'ng-class="{\'active\':hasSelectedItem(\''+code+'\',2)}" ' +
                                'id="treeItemCheck' + code + '"></div>';
                            checkEle = angular.element(checkEleHtml);
                            labelEle = angular.element('<div class="tree-list-item-label" id="treeItemLabel' + code + '"></div>');
                            checkEle.html('<i class="fa fa-circle"></i>');
                            labelEle.html(label);
                            ele.append(checkEle);
                            ele.append(labelEle);
                        }
                        if (checkEle) {
                            (function (obj) {
                                checkEle.on('click', function () {
                                    self._itemClicked(obj);
                                })
                            })(item);
                        }
                        (function (l, c, obj) {
                            labelEle.on('click', function () {
                                self._selectTreeItem(l, c, obj);
                            })
                        })(level, code, item);
                        treeItem.append(ele);
                        if (this.selectedItems.indexOf(code) >= 0) {
                            (function (l, c, obj) {
                                self._selectTreeItem(l, c, obj, true);
                            })(level, code, item);
                        }
                    }
                },
                /**
                 * 选择item触发方法
                 * @param {Object} level
                 * @param {Object} code
                 * @param {Object} item
                 * @param {Object} init 初始化
                 */
                _selectTreeItem: function (level, code, item, init) {
                    for (var j = level + 2; j <= this.maxCol; j++) {
                        var itemId = 'tree_col_' + j;
                        var elem = this._querySelector('#' + itemId);
                        if (elem) elem.remove();
                    }
                    var tree = this._querySelector('#tree_group_body');
                    tree.css({
                        'width': ((level + 1) * 200) + 'px'
                    });
                    var self = this;
                    var child = self._getItemChilds(code, level);
                    var backFun = function (child) {
                        item.childrenList = child;
                        if (child.length > 0) {//非最后一级
                            //if(!this.canSelectMore) self._removeActiveClass();
                            self._addTreeItems(level + 1, child, item);
                            self._scrollToRight(200);
                            self._renderActiveClass();
                            return;
                        }
                        var elem = self._querySelector('#tree_col_' + (level + 1));
                        if (elem) elem.remove();
                        tree.css({
                            'width': (level * 200) + 'px'
                        });
                        if (!init && !self.canSelectParent) self._itemClicked(item);
                        if (init) self._renderActiveClass();
                    };
                    if (child || item.isEnd) {
                        backFun(child || []);
                        return;
                    }
                    self._scope.loading = true;
                    self._scope.getTreeData({
                        $level: level + 1,
                        $parent: item,
                        $callback: function (data) {
                            self._scope.loading = false;
                            self._scope.$evalAsync();
                            child = data || [];
                            self._setItemChilds(code, level, child);
                            backFun(child);
                        }
                    });
                },
                /**
                 * 判定item code是否选中
                 * @param code item主键
                 * @param type 1：canSelectParent：返回false 2：直接返回是否选中
                 * @private
                 */
                _hasSelectedItem: function (code, type) {
                    if (this.canSelectParent && type == 1) return false;
                    var key = this._attrs.hyaCodeKey || 'code';
                    var has = false;
                    for (var i = 0; i < this.selected.length; i++) {
                        if (this.selected[i][key] == code) {
                            has = true;
                            break;
                        }
                    }
                    return has;
                },
                /**
                 * 设置子数据
                 * @param code
                 * @param level
                 * @param child
                 * @private
                 */
                _setItemChilds: function (code, level, child) {
                    for (var i = 0; i < child.length; i++) {
                        child[i].parentCode = code;
                        child[i].level = level + 1;
                    }
                    this._setCache(code + ':' + level + ':Child', child);
                    this.appendDataList(child);
                },
                /**
                 * 获取子数据
                 * @param code
                 * @param level
                 * @private
                 */
                _getItemChilds: function (code, level) {
                    if (!this.doCache) {//不做缓存
                        return null;
                    }
                    return this._getCache(code + ':' + level + ':Child');
                },
                /**
                 * 添加一级数据信息
                 * @param {Object} level
                 */
                _addTreeItemGroup: function (level) {
                    var tree = this._querySelector('#tree_group_body');
                    var html = '<div class="tree-group-column" id="tree_col_' + level + '">';
                    html += '	<div id="tree_list_' + level + '" class="tree-group-column-list">';
                    html += '	</div>';
                    html += '</div>';
                    tree.append(html);
                    return this._querySelector('#tree_list_' + level);
                },
                /**
                 * 获取缓存
                 */
                _getCache: function (key) {
                    var userInfo = $appConfig.getUserInfo();
                    if (!userInfo || !userInfo.DLZH) return null;
                    var key = userInfo.DLZH + '-' + this.treeId + ':' + key;
                    return JSON.parse(localStorage.getItem(key));
                },
                /**
                 * 设置缓存
                 */
                _setCache: function (key, val) {
                    var userInfo = $appConfig.getUserInfo();
                    if (!userInfo || !userInfo.DLZH) return;
                    var key = userInfo.DLZH + '-' + this.treeId + ':' + key;
                    if (!val)
                        localStorage.removeItem(key);
                    else
                        localStorage.setItem(key, JSON.stringify(val));
                },
                _getItemByCode: function (code) {
                    if (!code) return null;
                    var key = this._attrs.hyaValueKey;
                    if (!key) return code;
                    if (angular.isObject(code)) {
                        code = code[key];
                    }
                    var item = null;
                    var len = this._scope.items.length;
                    for (var i = len - 1; i >= 0; i--) {
                        var data = this._scope.items[i];

                        if ((angular.isObject(data) && data[key] == code) || data == code) {
                            item = data;
                            break;
                        }
                    }
                    return item;
                },
                _getCodeByItem: function (item) {
                    if (!item) return null;
                    var code = item;
                    var key = this._attrs.hyaValueKey;
                    if (item && key && angular.isObject(item)) {
                        code = item[key];
                    }
                    return code;
                },
                _itemClicked: function (item) {
                    if (item.notSelect) return;
                    var key = this._attrs.hyaCodeKey || 'code';
                    var selectIndex = -1;
                    for (var i = 0; i < this.selected.length; i++) {
                        if (this.selected[i][key] == item[key]) {//已经选中，取消选中
                            selectIndex = i;
                            break;
                        }
                    }
                    this._removeActiveClass();
                    if (selectIndex >= 0) {//删除选中
                        this.selected.splice(selectIndex, 1);
                    } else {
                        if (!this.canSelectMore) this.selected = [];
                        this.selected.push(item);
                    }

                    this._scope.selectedLen = this.selected.length;
                    this._renderActiveClass();
                    this._scope.selectedList = this.selected;
                    this._scope.$evalAsync();
                },
                /**
                 * 确定按钮点击事件
                 * @private
                 */
                _selectedTreeItems: function () {
                    this._querySelector('.droplist-title', this._element).html(this._getSelectedLabel());
                    var val = this.canSelectMore ? this.selected : this.selected[0];
                    if (this._ctrl) {
                        this._ctrl.$setViewValue(val);
                    }
                    if (this._scope.selectedFn) this._scope.selectedFn.call(this, {value: val});
                    this.closeDialog();
                },
                setDisabled: function (disabled) {
                    this.disabled = disabled;
                },
                _renderActiveClass: function () {
                    this._removeActiveClass();
                    this._addActiveClass();
                },
                /**
                 * 添加active class
                 * @private
                 */
                _addActiveClass: function () {
                    var id = 'treeItem';
                    if (this.canSelectParent) id = 'treeItemCheck';
                    var key = this._attrs.hyaCodeKey || 'code';
                    for (var i = 0; i < this.selected.length; i++) {
                        var code = this.selected[i][key];
                        if (!this._querySelector('#' + id + code)) continue;
                        this._querySelector('#' + id + code).addClass('active');
                    }
                },
                /**
                 * 移除所有选中样式
                 * @private
                 */
                _removeActiveClass: function () {
                    var key = this._attrs.hyaCodeKey || 'code';
                    var eles = this._scope.dialog._dialog[0];
                    angular.element(eles.querySelectorAll('.active'))
                        .removeClass('active');
                },
                /**
                 * 向右移动
                 */
                _scrollToRight: function (scroll) {
                    scroll = scroll || 0;
                    var tree = this._querySelector('#tree_group_tree');
                    if (!tree) return;
                    tree[0].scrollLeft = tree[0].scrollLeft + scroll;
                },
                /**
                 * 获取选中项目名称（多个拼接）
                 * @private
                 */
                _getSelectedLabel: function () {
                    var appendStr = this._attrs.hyaAppendStr || ',';
                    var label = '';
                    var key = this._attrs.hyaLabelKey || 'label';
                    for (var i = 0; i < this.selected.length; i++) {
                        if (i > 0) label += appendStr;
                        label += this.selected[i][key];
                    }
                    if (label.length <= 0) label = this._scope.placeholder;
                    return label;
                },
                /**
                 * 获取选中项目名称
                 * @param 选中对象
                 * @private
                 */
                _getSelectItemLabel: function (item) {
                    if (!item) return this._getSelectedLabel();
                    var key = this._attrs.hyaLabelKey || 'label';
                    var label = item[key];
                    return label;
                },
                /**
                 * 获取所有数据数组
                 */
                getAllDataList: function () {
                    return this._getCache('allData') || [];
                },
                /**
                 * 设置所有数据
                 */
                setAllDataList: function (data) {
                    this._setCache('allData', data);
                },
                /**
                 * 向数据数组添加数据
                 */
                appendDataList: function (data) {
                    var list = this.getAllDataList() || [];
                    if (!data || data.length <= 0) return;
                    list.push.apply(list, data);
                    this.setAllDataList(list);
                },
                /**
                 * 获取选中各级数据
                 * @returns {Array}
                 * @private
                 */
                _getSelectItemsLink: function () {
                    if (typeof this._ctrl === 'undefined' || !this._ctrl) {
                        this.selected = [];
                        return [];
                    }
                    var selectedList = this._ctrl.$viewValue;
                    if (!selectedList) {
                        this.selected = [];
                        return [];
                    }
                    if (!Array.isArray(selectedList)) {//不是数组
                        selectedList = [];
                        selectedList.push(this._ctrl.$viewValue);
                    }
                    this.selected = selectedList;
                    this._scope.selectedList = this.selected;
                    this._scope.$evalAsync();
                    this._scope.selectedLen = selectedList.length;
                    if (this._scope.selectedLen <= 0) return [];
                    var selected = selectedList[this._scope.selectedLen - 1];
                    var res = [];
                    var key = this._attrs.hyaCodeKey || 'code';
                    var code = selected[key];
                    if (!code) return [];
                    var list = this.getAllDataList();
                    var data = list.filter(function (item) {
                        return item[key] == code;
                    });
                    if (!data || data.length <= 0) return res;
                    var sjdmbmbs = data[0].parentCode;
                    res.unshift(code);
                    while (sjdmbmbs) {
                        data = list.filter(function (item) {
                            return item[key] == sjdmbmbs;
                        });
                        if (!data || data.length <= 0) {
                            sjdmbmbs = null;
                            return res;
                        }
                        sjdmbmbs = data[0].parentCode;
                        res.unshift(data[0][key]);
                    }
                    return res;
                },
                _setDialog: function (dialog) {
                    this._scope.dialog = dialog;
                    this._scope.dialog._element.addClass('drop-list-dialog');

                    this._scope.dialog.show({animation: 'none'});
                    //初始化数据，显示页面
                    this.initVal();
                },
                _createDialog: function () {
                    if (this._scope.dialog) {
                        this._setDialog(this._scope.dialog);
                        return;
                    }

                    this._scope.showSelectVal = this._getSelectItemLabel.bind(this);
                    this._scope.removeSelectItem = function (item) {
                        var selectIndex = this.selected.indexOf(item);
                        if (selectIndex >= 0) {//删除选中
                            this.selected.splice(selectIndex, 1);
                        }
                        this._scope.selectedLen = this.selected.length;
                        this._scope.selectedList = this.selected;
                        this._scope.$evalAsync();
                        this._renderActiveClass();
                    }.bind(this);
                    this._scope.toggitSelectBody = function () {
                        this._scope.config.hideBody = !this._scope.config.hideBody;
                    }.bind(this);
                    var page = $onsen.DIRECTIVE_TEMPLATE_URL + '/hy_drop_tree_dialog.tpl';
                    ons.createDialog(page, {parentScope: this._scope}).then(function (dialog) {
                        this._setDialog(dialog);
                    }.bind(this));
                },
                closeDialog: function () {
                    if (!this._scope.dialog) return;
                    this._scope.dialog.hide({animation: 'none'});
                    this._scope.dialog.destroy();
                    this._scope.dialog = null;
                },
                showDialog: function () {
                    if (this._attrs.hasOwnProperty('hyaSelectBefor') && angular.isFunction(this._scope.selectBefor)) {
                        if (this._scope.selectBefor.call(this)) {
                            this.openDialog();
                        }
                    } else {
                        this.openDialog();
                    }
                },
                openDialog: function () {
                    if (this.disabled)
                        return;
                    if (!this._scope.dialog) {
                        this._createDialog();
                    } else {
                        this._setDialog(this._scope.dialog);
                    }
                },
                destroy: function () {
                    this._scope.$destroy();
                },
                _destroy: function () {
                    this._scope = undefined;
                    this._element = undefined;
                    this._attrs = undefined;
                }
            });

            MicroEvent.mixin(HyDropTreeService);
            return HyDropTreeService;
        }]);

    module.directive('hyDropTree', ['HyDropTreeService', '$onsen', function (HyDropTreeService, $onsen) {
        return {
            restrict: 'E',
            require: '?ngModel',
            scope: {
                selectedFn: '&hyaSelected',
                getTreeData: '&hyaGetTreeData',
                selectBefor: '&hyaSelectBefor',
                icon: '@icon'
            },
            replace: true,
            template: '<div class="tree-drop-box" ng-class="{\'no-select-option\':selectedLen<=0}" ng-click="showDialog();">' +
                '<span class="droplist-title">{{placeholder}}</span>' +
                //'<ons-icon ng-if="!hideArrow" icon="{{icon}}" size="20px" fixed-width="false" class="droplist-arrow"></ons-icon>' +
                '</div>',
            compile: function (element, attrs) {
                return function (scope, element, attrs, ngModel) {
                    var hyDropTree = new HyDropTreeService(scope, element, attrs, ngModel);
                    $onsen.declareVarAttribute(attrs, hyDropTree);
                    //hyDropTree.initVal();
                };
            }
        };
    }]);

}());
