// global definitions

var platform = require('./platform');
Fire.Platform = platform;

/**
 * @property {Boolean} isNode - !#en indicates whether executes in node.js application !#zh 是否在 nodejs 运行环境下
 */
Fire.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
Fire.isNodeWebkit = !!(Fire.isNode && 'node-webkit' in process.versions);   // node-webkit
Fire.isAtomShell = !!(Fire.isNode && 'atom-shell' in process.versions);     // atom-shell

/**
 * indicates whether executes in Fireball editor
 * @property isEditor
 * @type {Boolean}
 */
Fire.isEditor = Fire.isNode && !platform.isDistributed;     // by far there is no standalone client version, so app == editor
// Always export FIRE_EDITOR globally
if (typeof FIRE_EDITOR === 'undefined') {
    eval('FIRE_EDITOR=Fire.isEditor');  // use eval to ignore uglify
}

/**
 * indicates whether executes in common web browser, or editor's window process(atom-shell's renderer context)
 * @property isWeb
 * @type {Boolean}
 */
Fire.isWeb = (typeof window === 'object' && typeof document === 'object');

/**
 * indicates whether executes in common web browser
 * @property isPureWeb
 * @type {Boolean}
 */
Fire.isPureWeb = Fire.isWeb && !Fire.isNode;      // common web browser

/**
 * Indicates whether executes in editor's main process (Electron's browser context)
 * @property isCoreLevel
 * @type {Boolean}
 */
Fire.isCoreLevel = Fire.isEditor && !Fire.isWeb;

if (Fire.isNode) {
    /**
     * indicates whether executes in OSX
     * @property isDarwin
     * @type {Boolean}
     */
    Fire.isDarwin = process.platform === 'darwin';

    /**
     * indicates whether executes in Windows
     * @property isWin32
     * @type {Boolean}
     */
    Fire.isWin32 = process.platform === 'win32';
}
else if (Fire.isWeb) {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    var np = window.navigator.platform;
    Fire.isDarwin = np.substring(0, 3) === 'Mac';
    Fire.isWin32 = np.substring(0, 3) === 'Win';
}
else if (platform.isNative) {
    // native runtime
    Fire.isDarwin = platform.isNativeDarwin;
    Fire.isWin32 = platform.isNativeWin32;
}
else {
    // unknown
    Fire.isDarwin = false;
    Fire.isWin32 = false;
}

if (Fire.isPureWeb) {
    var nav = window.navigator;
    var ua = nav.userAgent.toLowerCase();

    /**
     * indicates whether executes in mobile device
     * @property isMobile
     * @type {Boolean}
     */
    Fire.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
    /**
     * indicates whether executes in iOS
     * @property isIOS
     * @type {Boolean}
     */
    Fire.isIOS = !!ua.match(/(iPad|iPhone|iPod)/i);
    /**
     * indicates whether executes in Android
     * @property isAndroid
     * @type {Boolean}
     */
    Fire.isAndroid = !!(ua.match(/android/i) || nav.platform.match(/android/i));
}
else if (platform.isNative) {
    Fire.isAndroid = platform.isNativeAndroid;
    Fire.isIOS = platform.isNativeIOS;
    Fire.isMobile = Fire.isAndroid || Fire.isIOS;
}
else {
    Fire.isAndroid = Fire.isIOS = Fire.isMobile = false;
}

/**
 * !#en Check if running in retina display
 * !#zh 判断窗口是否显示在 Retina 显示器下。这个属性会随着窗口所在的显示器变化而变化
 * @property isRetina
 * @type boolean
 */
Object.defineProperty(Fire, 'isRetina', {
    get: function () {
        return Fire.isWeb && window.devicePixelRatio && window.devicePixelRatio > 1;
    }
});

/**
 * !#en Indicates whether retina mode is enabled currently. Retina mode is enabled by default for Apple device but disabled for other devices.
 * !#zh 判断当前是否启用 retina 渲染模式。Fire.isRetina 只是表示系统的支持状态，而最终是否启用 retina 则取决于 Fire.isRetinaEnabled。由于安卓太卡，这里默认禁用 retina。
 * @property isRetinaEnabled
 * @type {Boolean}
 */
Fire.isRetinaEnabled = (Fire.isIOS || Fire.isDarwin) && !FIRE_EDITOR && Fire.isRetina;

// definitions for FObject._objFlags

var Destroyed = 1 << 0;
var ToDestroy = 1 << 1;
var DontSave = 1 << 2;
var EditorOnly  = 1 << 3;
var Dirty = 1 << 4;
var DontDestroy = 1 << 5;
//var NodeSavedAsWrapper = 1 << 6;

/**
 * Bit mask that controls object states.
 * @class _ObjectFlags
 * @static
 * @private
 */
var ObjectFlags = {

    // public flags

    /**
     * The object will not be saved.
     * @property DontSave
     * @type number
     */
    DontSave: DontSave,

    /**
     * The object will not be saved when building a player.
     * @property EditorOnly
     * @type number
     */
    EditorOnly: EditorOnly,

    Dirty: Dirty,

    /**
     * Dont destroy automatically when loading a new scene.
     * @property DontDestroy
     * @private
     */
    DontDestroy: DontDestroy,

    // public flags for engine

    Destroying: 1 << 9,

    /**
     * Hide in game and hierarchy.
     * This flag is readonly, it can only be used as an argument of scene.addEntity() or Entity.createWithFlags()
     * @property HideInGame
     * @type number
     */
    HideInGame: 1 << 10,

    // public flags for editor

    /**
     * This flag is readonly, it can only be used as an argument of scene.addEntity() or Entity.createWithFlags()
     * @property HideInEditor
     * @type number
     */
    HideInEditor: 1 << 11,

    // flags for Component
    IsOnEnableCalled: 1 << 12,
    IsOnLoadCalled: 1 << 13,
    IsOnStartCalled: 1 << 14,
    IsEditorOnEnabledCalled: 1 << 15

};

/**
 * Hide in game view, hierarchy, and scene view... etc.
 * This flag is readonly, it can only be used as an argument of scene.addEntity() or Entity.createWithFlags()
 * @property Hide
 * @type number
 */
ObjectFlags.Hide = ObjectFlags.HideInGame | ObjectFlags.HideInEditor;

Fire._ObjectFlags = ObjectFlags;

// can not clone these flags
var PersistentMask = ~(ToDestroy | Dirty | ObjectFlags.Destroying | DontDestroy |
                       ObjectFlags.IsOnEnableCalled |
                       ObjectFlags.IsEditorOnEnabledCalled |
                       ObjectFlags.IsOnLoadCalled |
                       ObjectFlags.IsOnStartCalled);

module.exports = {
    Destroyed: Destroyed,
    ToDestroy: ToDestroy,
    DontSave: DontSave,
    EditorOnly: EditorOnly,
    //Dirty: Dirty,
    //DontDestroy: DontDestroy,
    //NodeSavedAsWrapper: NodeSavedAsWrapper,
    PersistentMask: PersistentMask
};
