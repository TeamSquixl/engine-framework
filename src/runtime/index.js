
/**
 * This module provides interfaces for runtime implementation.
 * @module Fire.Runtime
 * @main
 */

var Runtime = {};

var register = require('./register');

Fire.JS.mixin(Runtime, {
    NodeWrapper: require('./wrappers/node'),
    SceneWrapper: require('./wrappers/scene'),
    registerNodeType: register.registerNodeType,

    registerMixin: register.registerMixin,

    EngineWrapper: require('./wrappers/engine'),
    registerEngine: register.registerEngine
});

// load utility methods
require('./extends/node');
require('./extends/scene');
require('./extends/engine');

// register a default mixin solution
var mixin = require('./mixin');
register.registerMixin(mixin);

/**
 * @module Fire
 */

Fire.getWrapperType = register.getWrapperType;
Fire.menuToWrapper = register.menuToWrapper;
Fire.node = register.getWrapper;
Fire.getMixinOptions = register.getMixinOptions;

/**
 * The SceneWrapper class registered by runtime.
 * @property SceneWrapperImpl
 * @type {Fire.Runtime.SceneWrapper}
 */
Fire.JS.get(Fire, 'SceneWrapperImpl', register.getRegisteredSceneWrapper);



module.exports = Runtime;
