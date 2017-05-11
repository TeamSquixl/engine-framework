var root = typeof global !== 'undefined' ? global : window;

/**
 * !#en
 * Global object with runtime classes, properties and methods you can access from anywhere.
 *
 * `Fire(node)` takes a runtime node and return its corresponding Fire.Runtime.NodeWrapper instance.
 *
 * Submodules:
 * - [JS](./Fire.JS.html)
 * - [Runtime](./Fire.Runtime.html)
 *
 * !#zh
 * 可全局访问的公共方法和属性，也会包括一些组件和类的静态方法。
 * Fire 本身也是一个方法，直接调用的话将返回或新建跟给定 node 相互绑定的 NodeWrapper 实例。
 *
 * 包含的子模块:
 * - [JS](./Fire.JS.html)
 * - [Runtime](./Fire.Runtime.html)
 *
 * @module Fire
 * @main Fire
 */
var getWrapper;
if (!root.Fire) {
    // Always export Fire globally.
    root.Fire = function (node) {
        return getWrapper(node);
    };
}

Fire._setWrapperGetter = function (getter) {
    getWrapper = getter;
};

require('./definition');

// declare pre-process macros globally for uglify
// use eval to ignore uglify
if (typeof FIRE_DEBUG === 'undefined') {
    eval('FIRE_DEBUG=!0');
}
if (typeof FIRE_DEV === 'undefined') {
    if (FIRE_EDITOR || FIRE_DEBUG) {
        eval('FIRE_DEV=!0');
    }
    else {
        eval('FIRE_DEV=!1');
    }
}
if (typeof FIRE_TEST === 'undefined') {
    if (FIRE_EDITOR) {
        eval('FIRE_TEST=typeof describe!=="undefined" || typeof QUnit!=="undefined"');
        //Editor.log('FIRE_TEST = ' + FIRE_TEST);
    }
    else {
        eval('FIRE_TEST=!1');       // use eval to ignore uglify
    }
}

// javascript extends

require('./js');
if (!Fire.log) {
    // 编辑器已经定义了 Fire.log
    require('./log');
}
require('./math');
require('./utils');
require('./enum');
require('./fobject');
require('./class-new');
require('./value-types');
require('./callbacks-invoker');
require('./path');
require('./intersection');
require('./polygon');

// engine toolkit

require('./url');
require('./raw-asset');
require('./asset');
require('./deserialize');
require('./instantiate');
require('./event/event-target');
require('./playable');
require('./../runtime/behavior');

// script management

require('./requiring-frame');

if (!(Fire.isEditor && Fire.isCoreLevel)) {
    // codes only available in page level
    require('./ticker');
    require('./time');
    require('./loaders');
    require('./load-manager');
    require('./asset-library');
}

module.exports = Fire;
