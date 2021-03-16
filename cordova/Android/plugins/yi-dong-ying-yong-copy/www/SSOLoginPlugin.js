cordova.define("yi-dong-ying-yong-copy.SSOLoginPlugin", function(require, exports, module) {
    var exec = require('cordova/exec');
    var SSOLoginPlugin = function () {
    };

    /**
     * 平台单点登录验证
     */
    SSOLoginPlugin.prototype.checkPermission = function () {
        exec(null,null,"SSO","checkPermission",[]);
    };

    /**
     * 平台单点登录
     */
    SSOLoginPlugin.prototype.login = function(success,fail,type,pack){
        // type = 1; sso v1登录
        // type = 2; sso v2登录
        exec(success,fail,"SSO","ssoLogin",[type,pack]);
    };

    SSOLoginPlugin.prototype.loginDebugiOS = function(success,fail,type,pack){
        // type = 1; sso v1登录
        // type = 2; sso v2登录
        exec(success,fail,"SSO","ssoLogin",[type,pack]);
    };

    SSOLoginPlugin.prototype.fetchParams = function(success,fail,type,pack){
        // type = 1; sso v1登录
        // type = 2; sso v2登录
        exec(success,fail,"SSO","ssoLogin",[type,pack]);
    };

    module.exports = new SSOLoginPlugin();

});