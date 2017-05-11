
// enum

/**
 * Define an enum type. If a enum item has a value of -1, it will be given an Integer number according to it's order in the list. Otherwise it will use the value specified by user who writes the enum definition.
 * @method defineEnum
 * @param {object} obj - a JavaScript literal object containing enum names and values
 * @return {object} the defined enum type
 *
 * @example
 Texture.WrapMode = Fire.defineEnum({
    Repeat: -1,
    Clamp: -1
});
 // Texture.WrapMode.Repeat == 0
 // Texture.WrapMode.Clamp == 1
 // Texture.WrapMode[0] == "Repeat"
 // Texture.WrapMode[1] == "Clamp"

 var FlagType = Fire.defineEnum({
    Flag1: 1,
    Flag2: 2,
    Flag3: 4,
    Flag4: 8,
});
 var AtlasSizeList = Fire.defineEnum({
    128: 128,
    256: 256,
    512: 512,
    1024: 1024,
});
 */
Fire.defineEnum = function (obj) {
    var enumType = {};
    Object.defineProperty(enumType, '__enums__', {
        value: undefined,
        writable: true
    });

    var lastIndex = -1;
    for (var key in obj) {
        var val = obj[key];
        if (val === -1) {
            val = ++lastIndex;
        }
        else {
            lastIndex = val;
        }
        enumType[key] = val;

        var reverseKey = '' + val;
        if (key !== reverseKey) {
            Object.defineProperty(enumType, reverseKey, {
                value: key,
                enumerable: false
            });
        }
    }
    return enumType;
};

Fire.isEnumType = function (enumType) {
    return enumType && enumType.hasOwnProperty('__enums__');
};

if (FIRE_DEV) {
    // check key order in object literal
    var _TestEnum = Fire.defineEnum({
        ZERO: -1,
        ONE: -1,
        TWO: -1,
        THREE: -1
    });
    if (_TestEnum.ZERO !== 0 || _TestEnum.ONE !== 1 || _TestEnum.TWO !== 2 || _TestEnum.THREE !== 3) {
        Fire.error('Sorry, "Fire.defineEnum" not available on this platform, ' +
                   'please report this error here: https://github.com/fireball-x/fireball/issues/new !');
    }
}
