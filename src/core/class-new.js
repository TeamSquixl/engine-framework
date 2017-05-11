require('./attribute');
var define = require('./class').define;
//var FObject = require('./fobject');
var getTypeChecker = require('./attribute').getTypeChecker;
var preprocessAttrs = require('./preprocess-attrs');


/**
 * !#en Defines a FireClass using the given specification, please see [Class](/en/scripting/class/) for details.
 * !#zh 定义一个 FireClass，传入参数必须是一个包含类型参数的字面量对象，具体用法请查阅[类型定义](/zh/scripting/class/)。
 *
 * @method Class
 * @param {object} options
 * @return {function} - the created class
 *
 * @example
    // define base class
    var Node = Fire.Class();

    // define sub class
    var Sprite = Fire.Class({
        name: 'Sprite',
        extends: Node,
        constructor: function () {
            this.url = "";
            this.id = 0;
        },

        properties {
            width: {
                default: 128,
                type: 'Integer',
                tooltip: 'The width of sprite'
            },
            height: 128,
            size: {
                get: function () {
                    return Fire.v2(this.width, this.height);
                }
            }
        },

        load: function () {
            // load this.url
        };
    });

    // instantiate

    var obj = new Sprite();
    obj.url = 'sprite.png';
    obj.load();

    // define static member

    Sprite.count = 0;
    Sprite.getBounds = function (spriteList) {
        // ...
    };
 */
Fire.Class = function (options) {
    if (arguments.length === 0) {
        return define();
    }
    if ( !options ) {
        Fire.error('[Fire.Class] Option must be non-nil');
        return define();
    }

    var name = options.name;
    var base = options.extends/* || FObject*/;
    var ctor = (options.hasOwnProperty('constructor') && options.constructor) || undefined;

    // create constructor
    var cls;
    cls = define(name, base, ctor);
    if (!name) {
        name = Fire.JS.getClassName(cls);
    }

    // define properties
    var properties = options.properties;
    if (properties) {

        // 预处理属性
        preprocessAttrs(properties, name);

        for (var propName in properties) {
            var val = properties[propName];
            var attrs = parseAttributes(val, name, propName);
            if (val.hasOwnProperty('default')) {
                cls.prop.apply(cls, [propName, val.default].concat(attrs));
            }
            else {
                var getter = val.get;
                var setter = val.set;
                if (FIRE_EDITOR) {
                    if (!getter && !setter) {
                        Fire.error('Property %s.%s must define at least one of "default", "get" or "set".', name,
                            propName);
                    }
                }
                if (getter) {
                    cls.get.apply(cls, [propName, getter].concat(attrs));
                }
                if (setter) {
                    cls.set(propName, setter);
                }
            }
        }
    }

    // define statics
    var statics = options.statics;
    if (statics) {
        var staticPropName;
        if (FIRE_EDITOR) {
            var INVALID_STATICS = ['name', '__ctors__', '__props__', 'arguments', 'call', 'apply', 'caller', 'get',
                                   'getset', 'length', 'prop', 'prototype', 'set'];
            for (staticPropName in statics) {
                if (INVALID_STATICS.indexOf(staticPropName) !== -1) {
                    Fire.error('Cannot define %s.%s because static member name can not be "%s".', name, staticPropName,
                        staticPropName);
                    continue;
                }
            }
        }
        for (staticPropName in statics) {
            cls[staticPropName] = statics[staticPropName];
        }
    }

    // define functions
    var BUILTIN_ENTRIES = ['name', 'extends', 'constructor', 'properties', 'statics'];
    for (var funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) !== -1) {
            continue;
        }
        var func = options[funcName];
        var type = typeof func;
        if (type === 'function' || func === null) {
            cls.prototype[funcName] = func;
        }
        else if (FIRE_EDITOR) {
            var TypoCheckList = {
                extend: 'extends',
                property: 'properties',
                static: 'statics'
            };
            var correct = TypoCheckList[funcName];
            if (correct) {
                Fire.warn('Unknown parameter of %s.%s, maybe you want is "%s".', name, funcName, correct);
            }
            else {
                Fire.error('Unknown parameter of %s.%s', name, funcName);
            }
        }
    }

    return cls;
};

var tmpAttrs = [];
function parseAttributes (attrs, className, propName) {
    var ERR_Type = FIRE_EDITOR ? 'The %s of %s must be type %s' : '';

    tmpAttrs.length = 0;
    var result = tmpAttrs;

    var type = attrs.type;
    if (type) {
        switch (type) {
            case 'Integer': // Fire.Integer
                result.push( { type: Fire.Integer, expectedTypeOf: 'number' } );
                break;
            case 'Float':   // Fire.Float
                result.push( { type: Fire.Float, expectedTypeOf: 'number' } );
                break;
            case 'Boolean': // Fire.Boolean
                result.push({
                    type: Fire.Boolean,
                    expectedTypeOf: 'number',
                    _onAfterProp: getTypeChecker(Fire.Boolean, 'Fire.Boolean')
                });
                break;
            case 'String':  // Fire.String
                result.push({
                    type: Fire.String,
                    expectedTypeOf: 'number',
                    _onAfterProp: getTypeChecker(Fire.String, 'Fire.String')
                });
                break;
            case 'Object':  // Fire.ObjectType
                if (FIRE_EDITOR) {
                    Fire.error('Please define "type" parameter of %s.%s as the actual constructor.', className, propName);
                }
                break;
            default:
                if (type === Fire._ScriptUuid) {
                    var attr = Fire.ObjectType(Fire.ScriptAsset);
                    attr.type = 'Script';
                    result.push(attr);
                }
                else {
                    if (typeof type === 'object') {
                        if (Fire.isEnumType(type)) {
                            result.push({
                                type: 'Enum',
                                expectedTypeOf: 'number',
                                enumList: Fire.getEnumList(type)
                            });
                        }
                        else if (FIRE_EDITOR) {
                            Fire.error('Please define "type" parameter of %s.%s as the constructor of %s.', className, propName, type);
                        }
                    }
                    else if (typeof type === 'function') {
                        result.push(Fire.ObjectType(type));
                        result.push( { expectedTypeOf: 'object' } );
                    }
                    else if (FIRE_EDITOR) {
                        Fire.error('Unknown "type" parameter of %s.%s：%s', className, propName, type);
                    }
                }
                break;
        }
    }
    else {
        if (attrs.default != null) {
            result.push({
                expectedTypeOf: typeof attrs.default,
            });
        }
    }

    function parseSimpleAttr (attrName, expectType, attrCreater) {
        var val = attrs[attrName];
        if (val) {
            if (typeof val === expectType) {
                if (typeof attrCreater === 'undefined') {
                    var attr = {};
                    attr[attrName] = val;
                    result.push(attr);
                }
                else {
                    result.push(typeof attrCreater === 'function' ? attrCreater(val) : attrCreater);
                }
            }
            else if (FIRE_EDITOR) {
                Fire.error('The %s of %s.%s must be type %s', attrName, className, propName, expectType);
            }
        }
    }

    parseSimpleAttr('rawType', 'string', Fire.RawType);
    parseSimpleAttr('editorOnly', 'boolean', Fire.EditorOnly);
    if (FIRE_EDITOR) {
        parseSimpleAttr('displayName', 'string');
        parseSimpleAttr('multiline', 'boolean', {multiline: true});
        parseSimpleAttr('readonly', 'boolean', {readonly: true});
        parseSimpleAttr('tooltip', 'string');
    }

    if (attrs.isRuntimeNode) {
        result.push({ isRuntimeNode: true });
    }
    if (attrs.url) {
        result.push({ saveUrlAsAsset: true });
    }
    if (attrs.serializable === false) {
        result.push(Fire.NonSerialized);
    }

    if (FIRE_EDITOR) {
        var visible = attrs.visible;
        if (typeof visible !== 'undefined') {
            if (!attrs.visible) {
                result.push({visible: false});
            }
        }
        else {
            var startsWithUS = (propName.charCodeAt(0) === 95);
            if (startsWithUS) {
                result.push({visible: false});
            }
        }
    }

    //if (attrs.custom) {
    //    result.push( { custom: attrs.custom });
    //}

    var range = attrs.range;
    if (range) {
        if (Array.isArray(range)) {
            if (range.length >= 2) {
                result.push(Fire.Range(range[0], range[1]));
            }
            else if (FIRE_EDITOR) {
                Fire.error('The length of range array must be 2');
            }
        }
        else if (FIRE_EDITOR) {
            Fire.error(ERR_Type, '"range"', className + '.' + propName, 'array');
        }
    }

    var nullable = attrs.nullable;
    if (nullable) {
        if (typeof nullable === 'object') {
            var boolPropName = nullable.propName;
            if (typeof boolPropName === 'string') {
                var def = nullable.default;
                if (typeof def === 'boolean') {
                    result.push(Fire.Nullable(boolPropName, def));
                }
                else if (FIRE_EDITOR) {
                    Fire.error(ERR_Type, '"default"', 'nullable object', 'boolean');
                }
            }
            else if (FIRE_EDITOR) {
                Fire.error(ERR_Type, '"propName"', 'nullable object', 'string');
            }
        }
        else if (FIRE_EDITOR) {
            Fire.error(ERR_Type, '"nullable"', className + '.' + propName, 'object');
        }
    }

    if (FIRE_EDITOR) {
        var watch = attrs.watch;
        if (watch) {
            if (typeof watch === 'object') {
                for (var watchKey in watch) {
                    var watchCallback = watch[watchKey];
                    if (typeof watchCallback === 'function') {
                        result.push(Fire.Watch(watchKey.split(' '), watchCallback));
                    }
                    else if (FIRE_EDITOR) {
                        Fire.error(ERR_Type, 'value', 'watch object', 'function');
                    }
                }
            }
            else {
                Fire.error(ERR_Type, 'watch', className + '.' + propName, 'object');
            }
        }
    }

    return result;
}
