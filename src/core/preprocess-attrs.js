
// 增加预处理属性这个步骤的目的是降低 FireClass 的实现难度，将比较稳定的通用逻辑和一些需求比较灵活的属性需求分隔开。

var SerializableAttrs = {
    url: {
        canUsedInGet: true
    },
    default: {},
    serializable: {},
    editorOnly: {},
    rawType: {},
};

// 预处理 notify 等扩展属性
function parseNotify (val, propName, notify, properties) {
    if (val.get || val.set) {
        if (FIRE_DEV) {
            Fire.warn('"notify" can\'t work with "get/set" !');
        }
        return;
    }
    if (val.hasOwnProperty('default')) {
        // 添加新的内部属性，将原来的属性修改为 getter/setter 形式
        // 以 _ 开头将自动设置property 为 Fire.HideInInspector
        var newKey = "_valOf$" + propName;

        val.get = function () {
            return this[newKey];
        };
        val.set = function (value) {
            var oldValue = this[newKey];
            this[newKey] = value;
            notify.call(this, oldValue);
        };

        var newValue = {};
        properties[newKey] = newValue;
        // 将不能用于get方法中的属性移动到newValue中
        for (var attr in SerializableAttrs) {
            var v = SerializableAttrs[attr];
            if (val.hasOwnProperty(attr)) {
                newValue[attr] = val[attr];
                if (!v.canUsedInGet) {
                    delete val[attr];
                }
            }
        }
    }
    else if (FIRE_DEV) {
        Fire.warn('"notify" must work with "default" !');
    }
}

// auto set wrapper's type
function parseWrapper (val, propName, wrapperOf, classname) {
    if (FIRE_EDITOR) {
        Fire.info('The "wrapper" attribute of %s.%s is obsoleted, use "type" instead please.', classname, propName);
        if (val.type) {
            Fire.warn('The "wrapper" attribute of %s.%s can not be used with "type"', classname, propName);
        }
        if (Fire.isChildClassOf(wrapperOf, Fire.Runtime.NodeWrapper)) {
            val.type = wrapperOf;
            return;
        }
        var wrapper = Fire.getWrapperType(wrapperOf);
        if (wrapper) {
            val.type = wrapper;
        }
        else {
            Fire.warn('Can not declare "wrapper" attribute for %s.%s, the registered wrapper of "%s" is not found.',
                name, propName, Fire.JS.getClassName(wrapperOf));
        }
    }
}

function checkUrl (val, className, propName, url) {
    if (Array.isArray(url)) {
        if (url.length > 0) {
            url = url[0];
        }
        else if (FIRE_EDITOR) {
            return Fire.error('Invalid url of %s.%s', className, propName);
        }
    }
    if (FIRE_EDITOR) {
        if (typeof url !== 'function' || !Fire.isChildClassOf(url, Fire.RawAsset)) {
            return Fire.error('The "url" type of "%s.%s" must be child class of Fire.RawAsset.', className, propName);
        }
        if (Fire.isChildClassOf(url, Fire.Asset)) {
            return Fire.error('The "url" type of "%s.%s" must not be child class of Fire.Asset,' +
                       'otherwise you should use "type: %s" instead.', className, propName, Fire.JS.getClassName(url));
        }
        if (val.type) {
            return Fire.warn('Can not specify "type" attribute for "%s.%s", because its "url" is already defined.', className, propName);
        }
    }
    val.type = url;
}

function parseType (val, type, className, propName) {
    if (Array.isArray(type)) {
        if (type.length > 0) {
            val.type = type = type[0];
        }
        else {
            return Fire.error('Invalid type of %s.%s', className, propName);
        }
    }
    if (typeof type === 'function') {
        if (FIRE_EDITOR) {
            var isRaw = Fire.isChildClassOf(type, Fire.RawAsset) && !Fire.isChildClassOf(type, Fire.Asset);
            if (isRaw) {
                Fire.warn('The "type" attribute of "%s.%s" must be child class of Fire.Asset, ' +
                          'otherwise you should use "url: %s" instead', className, propName,
                    Fire.JS.getClassName(type));
            }
        }
        var isRuntimeNode = Fire.getWrapperType(type);
        if (isRuntimeNode) {
            val.isRuntimeNode = true;
        }
    }
}

function postCheckType (val, type, className, propName) {
    if (typeof type === 'function' && FIRE_EDITOR) {
        if (Fire._isFireClass(type) && val.serializable !== false && !Fire.JS._getClassId(type, false)) {
            Fire.warn('Can not serialize "%s.%s" because the specified type is anonymous, please provide a class name or set the "serializable" attribute of "%s.%s" to "false".', className, propName, className, propName);
        }
    }
}

module.exports = function (properties, className) {
    for (var propName in properties) {
        var val = properties[propName];
        
        var isObj = val && typeof val === 'object' && !Array.isArray(val);
        var isLiteral = isObj && val.constructor === Object;
        if ( !isLiteral ) {
            properties[propName] = val = {
                default: val
            };
        }
        if (val) {
            var notify = val.notify;
            if (notify) {
                parseNotify(val, propName, notify, properties);
            }

            var type = val.type;
            if (type) {
                parseType(val, type, className, propName);
            }

            if (FIRE_EDITOR) {
                var wrapperOf = val.wrapper;
                if (wrapperOf) {
                    parseWrapper(val, propName, wrapperOf, className);
                }
            }

            var url = val.url;
            if (url) {
                checkUrl(val, className, propName, url);
            }

            type = val.type;
            if (type) {
                postCheckType(val, type, className, propName);
            }
        }
    }
};
