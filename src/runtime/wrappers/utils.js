var JS = Fire.JS;

function NYI (func) {
    if (FIRE_EDITOR/* && !FIRE_TEST*/) {
        Fire.info('Not yet implemented: ' + func);
    }
}

function NYI_Accessor (defVal, attrs, noSetter, func) {
    if (typeof noSetter === 'string') {
        func = noSetter;
        noSetter = false;
    }
    if (typeof attrs === 'string') {
        func = attrs;
        attrs = null;
        noSetter = false;
    }
    var prop = {
        get: function () {
            NYI(func);
            return defVal;
        }
    };
    if (!noSetter) {
        prop.set = NYI.bind(func);
    }
    if (attrs) {
        return JS.mixin(prop, attrs);
    }
    else {
        return prop;
    }
}

module.exports = {
    NYI: NYI,
    NYI_Accessor: NYI_Accessor,
    NIL: function () {}
};
