var requiringFrames = [];  // the requiring frame infos

Fire._RFpush = function (module, uuid, script) {
    if (arguments.length === 2) {
        script = uuid;
        uuid = '';
    }
    requiringFrames.push({
        uuid: uuid,
        script: script,
        module: module,
        exports: module.exports,    // original exports
        beh: null
    });
};

Fire._RFpop = function () {
    var frameInfo = requiringFrames.pop();
    // check exports
    var module = frameInfo.module;
    var exports = module.exports;
    if (exports === frameInfo.exports) {
        for (var anyKey in exports) {
            // exported
            return;
        }
        // auto export behavior
        module.exports = exports = frameInfo.beh;
    }
    //if (Fire.isChildClassOf(exports, Fire.Behavior)) {
    //    if (frameInfo.script) {
    //        if (! Fire.JS.getClassName(exports)) {
    //            Fire.JS.setClassName(frameInfo.script, exports);
    //        }
    //        else {
    //            Fire.warn('Sorry, specifying class name for exported Behavior is not allowed.');
    //        }
    //    }
    //    if (frameInfo.uuid) {
    //        Fire.JS._setClassId(frameInfo.uuid, exports);
    //    }
    //}
};

Fire._RFpeek = function () {
    return requiringFrames[requiringFrames.length - 1];
};

if (FIRE_EDITOR) {
    Fire._RFreset = function () {
        requiringFrames = [];
    };
}
