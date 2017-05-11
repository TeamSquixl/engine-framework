var JS = require('./js');
var Utils = require('./utils');
var _isPlainEmptyObj_DEV = Utils.isPlainEmptyObj_DEV;
var _cloneable_DEV = Utils.cloneable_DEV;

require('./attribute');

///**
// * both getter and prop must register the name into __props__ array
// * @param {string} name - prop name
// */
var _appendProp = function (cls, name/*, isGetter*/) {
    if (FIRE_DEV) {
        //var JsVarReg = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        //if (!JsVarReg.test(name)) {
        //    Fire.error('The property name "' + name + '" is not compliant with JavaScript naming standards');
        //    return;
        //}
        if (name.indexOf('.') !== -1) {
            Fire.error('Disallow to use "." in property name');
            return;
        }
    }

    var index = cls.__props__.indexOf(name);
    if (index < 0) {
        cls.__props__.push(name);
    }
    // 这里不进行报错，因为重写 prop 可以是一个合法的行为，可以用于设置新的默认值。
    //else {
    //    Fire.error(Fire.getClassName(cls) + '.' + name + ' is already defined!');
    //}
};

///**
// * the metaclass of the "fire class" created by Fire.define, all its static members
// * will inherited by fire class.
// */
var _metaClass = {

    prop: function (name, defaultValue, attribute) {
        'use strict';
        if (FIRE_DEV) {
            // check default object value
            if (typeof defaultValue === 'object' && defaultValue) {
                if (Array.isArray(defaultValue)) {
                    // check array empty
                    if (defaultValue.length > 0) {
                        Fire.error('Default array must be empty, set default value of %s.%s to [], ' +
                                   'and initialize in "onLoad" or "constructor" please. (just like "this.%s = [...];")',
                                    JS.getClassName(this), name, name);
                        return this;
                    }
                }
                else if (!_isPlainEmptyObj_DEV(defaultValue)) {
                    // check cloneable
                    if (!_cloneable_DEV(defaultValue)) {
                        Fire.error('Do not set default value to non-empty object, ' +
        'unless the object defines its own "clone" function. Set default value of %s.%s to null or {}, ' +
        'and initialize in "onLoad" or "constructor" please. (just like "this.%s = {foo: bar};")',
                            JS.getClassName(this), name, name);
                        return this;
                    }
                }
            }

            // check base prototype to avoid name collision
            for (var base = this.$super; base; base = base.$super) {
                // 这个循环只能检测到最上面的FireClass的父类，如果再上还有父类，将不做检测。（Fire.extend 将 prototype.constructor 设为子类）
                if (base.prototype.hasOwnProperty(name)) {
                    Fire.error('Can not declare %s.%s, it is already defined in the prototype of %s',
                        JS.getClassName(this), name, JS.getClassName(base));
                    return;
                }
            }
        }

        // set default value
        Fire.attr(this, name, { 'default': defaultValue });

        _appendProp(this, name);

        // apply attributes
        if (attribute) {
            var onAfterProp = null;
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                Fire.attr(this, name, attr);
                // register callback
                if (attr._onAfterProp) {
                    onAfterProp = onAfterProp || [];
                    onAfterProp.push(attr._onAfterProp);
                }
            }
            // call callback
            if (onAfterProp) {
                for (var c = 0; c < onAfterProp.length; c++) {
                    onAfterProp[c](this, name);
                }
            }
        }
        return this;
    },

    get: function (name, getter, attribute) {
        'use strict';

        if (FIRE_DEV) {
            var d = Object.getOwnPropertyDescriptor(this.prototype, name);
            if (d && d.get) {
                Fire.error('%s: the getter of "%s" is already defined!', JS.getClassName(this), name);
                return this;
            }
        }

        if (attribute) {
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                if (FIRE_DEV) {
                    if (attr._canUsedInGetter === false) {
                        Fire.error('Can not apply the specified attribute to the getter of "%s.%s", attribute index: %s',
                            JS.getClassName(this), name, (i - AttrArgStart));
                        continue;
                    }
                }

                Fire.attr(this, name, attr);

                if (FIRE_DEV) {
                    // check attributes
                    if (attr.serializable === false || attr.editorOnly === true) {
                        Fire.warn('No need to use Fire.NonSerialized or Fire.EditorOnly for the getter of %s.%s, ' +
                                  'every getter is actually non-serialized.',
                            JS.getClassName(this), name);
                    }
                    if (attr.hasOwnProperty('default')) {
                        Fire.error('%s: Can not set default value of a getter!', JS.getClassName(this));
                        return this;
                    }
                }
            }
        }

        var forceSerializable = false;
        if ( !forceSerializable ) {
            Fire.attr(this, name, Fire.NonSerialized);
        }
        if (forceSerializable || FIRE_EDITOR) {
            // 不论是否 hide in inspector 都要添加到 props，否则 asset watcher 不能正常工作
            _appendProp(this, name/*, true*/);
        }

        if (Object.getOwnPropertyDescriptor(this.prototype, name)) {
            Object.defineProperty(this.prototype, name, {
                get: getter
            });
        }
        else {
            Object.defineProperty(this.prototype, name, {
                get: getter,
                configurable: true,
                enumerable: true
            });
        }

        if (FIRE_EDITOR) {
            Fire.attr(this, name, {hasGetter: true}); // 方便 editor 做判断
        }
        return this;
    },

    set: function (name, setter) {
        if (FIRE_DEV) {
            var d = Object.getOwnPropertyDescriptor(this.prototype, name);
            if (d && d.set) {
                Fire.error('%s: the setter of "%s" is already defined!', JS.getClassName(this), name);
                return this;
            }
        }

        if (FIRE_EDITOR) {
            Object.defineProperty(this.prototype, name, {
                set: function setter_editorWrapper (value) {
                    if (this._observing) {
                        Object.getNotifier(this).notify({
                            type: 'update',
                            name: name,
                            oldValue: this[name]
                        });
                    }
                    setter.call(this, value);
                },
                configurable: true,
                enumerable: true
            });
            Fire.attr(this, name, { hasSetter: true }); // 方便 editor 做判断
        }
        else {
            if (Object.getOwnPropertyDescriptor(this.prototype, name)) {
                Object.defineProperty(this.prototype, name, {
                    set: setter
                });
            }
            else {
                Object.defineProperty(this.prototype, name, {
                    set: setter,
                    configurable: true,
                    enumerable: true
                });
            }
        }

        return this;
    }
};

function instantiateProps (instance, itsClass) {
    var propList = itsClass.__props__;
    for (var i = 0; i < propList.length; i++) {
        var prop = propList[i];
        var attrs = Fire.attr(itsClass, prop);
        if (attrs && attrs.hasOwnProperty('default')) {  // getter does not have default, default maybe 0
            var def = attrs.default;
            if (def) {
                if (typeof def === 'object' && def) {
                    if (typeof def.clone === 'function') {
                        def = def.clone();
                    }
                    else if (Array.isArray(def)) {
                        def = [];
                    }
                    else {
                        def = {};
                    }
                }
                else if (typeof def === 'function') {
                    if (FIRE_EDITOR) {
                        try {
                            def = def();
                        }
                        catch (e) {
                            Fire._throw(e);
                        }
                    }
                    else {
                        def = def();
                    }
                }
            }
            instance[prop] = def;
        }
    }
}

/**
 * Checks whether the constructor is created by Fire.define or Fire.Class
 *
 * @method _isFireClass
 * @param {function} constructor
 * @return {Boolean}
 * @private
 */
Fire._isFireClass = function (constructor) {
    return !!constructor && (constructor.prop === _metaClass.prop);
};

///**
// * @method _convertToFireClass
// * @param {function} constructor
// * @private
// */
//Fire._convertToFireClass = function (constructor) {
//    constructor.prop = _metaClass.prop;
//};

/**
 * Checks whether subclass is child of superclass or equals to superclass
 *
 * @method isChildClassOf
 * @param {function} subclass
 * @param {function} superclass
 * @return {Boolean}
 */
Fire.isChildClassOf = function (subclass, superclass) {
    if (subclass && superclass) {
        if (typeof subclass !== 'function') {
            if (FIRE_DEV) {
                Fire.warn('[isChildClassOf] subclass should be function type, not', subclass);
            }
            return false;
        }
        if (typeof superclass !== 'function') {
            if (FIRE_DEV) {
                Fire.warn('[isChildClassOf] superclass should be function type, not', superclass);
            }
            return false;
        }
        // fireclass
        for (; subclass && subclass.$super; subclass = subclass.$super) {
            if (subclass === superclass) {
                return true;
            }
        }
        if (subclass === superclass) {
            return true;
        }
        // js class
        var dunderProto = Object.getPrototypeOf(subclass.prototype);
        while (dunderProto) {
            subclass = dunderProto.constructor;
            if (subclass === superclass) {
                return true;
            }
            dunderProto = Object.getPrototypeOf(subclass.prototype);
        }
    }
    return false;
};

function doDefine (className, baseClass, constructor) {
    var useTryCatch = ! (className && className.startsWith('Fire.'));
    var fireClass = _createCtor(constructor, baseClass, className, useTryCatch);

    // occupy some non-inherited static members
    for (var staticMember in _metaClass) {
        Object.defineProperty(fireClass, staticMember, {
            value: _metaClass[staticMember]
        });
    }

    if (baseClass) {
        // inherit
        JS.extend(fireClass, baseClass);    // 这里会把父类的 __props__ 复制给子类
        fireClass.$super = baseClass;

        if (baseClass.__props__ && baseClass.__props__.length > 0) {
            // copy __props__
            fireClass.__props__ = baseClass.__props__.slice();
        }
        else {
            fireClass.__props__ = [];
        }
    }
    else {
        fireClass.__props__ = [];
    }

    JS.setClassName(className, fireClass);

    return fireClass;
}

function define (className, baseClass, constructor) {
    if (Fire.isChildClassOf(baseClass, Fire.Behavior)) {
        var frame = Fire._RFpeek();
        if (frame) {
            if (FIRE_DEV && constructor) {
                Fire.warn('Fire.Class: Should not define constructor for Fire.Behavior.');
            }
            if (frame.beh) {
                Fire.error('Each script can have at most one Behavior.');
                return;
            }
            var isInProject = frame.uuid;
            if (isInProject) {
                if (className) {
                    Fire.warn('Should not specify class name for Behavior which defines in project.');
                }
            }
            //else {
            //    builtin plugin behavior
            //}
            className = className || frame.script;
            var cls = doDefine(className, baseClass, constructor);
            if (frame.uuid) {
                JS._setClassId(frame.uuid, cls);
            }
            frame.beh = cls;
            return cls;
        }
    }
    // not project behavior
    return doDefine(className, baseClass, constructor);
}

function _checkCtor (ctor) {
    if (FIRE_DEV) {
        if (Fire._isFireClass(ctor)) {
            Fire.error("Constructor can not be another FireClass");
            return;
        }
        if (typeof ctor !== 'function') {
            Fire.error("Constructor of FireClass must be function type");
            return;
        }
        if (ctor.length > 0) {
            // fireball-x/dev#138: To make a unified FireClass serialization process,
            // we don't allow parameters for constructor when creating instances of FireClass.
            // For advance user, construct arguments can still get from 'arguments'.
            Fire.warn("Can not instantiate FireClass with arguments.");
            return;
        }
    }
}

function normalizeClassName (className) {
    if (FIRE_EDITOR) {
        var DefaultName = 'FireClass';
        if (className) {
            className = className.replace(/\./g, '_');
            className = className.split('').filter(function (x) { return /^[a-zA-Z0-9_$]/.test(x) }).join('');
            try {
                // validate name
                eval('function ' + className + '(){}');
            }
            catch (e) {
                className = 'FireClass_' + className;
                try {
                    eval('function ' + className + '(){}');
                }
                catch (e) {
                    return DefaultName;
                }
            }
            return className;
        }
        return DefaultName;
    }
}

function _createCtor (constructor, baseClass, className, useTryCatch) {
    if (constructor && FIRE_DEV) {
        _checkCtor(constructor);
    }
    // get base user constructors
    var ctors;
    if (Fire._isFireClass(baseClass)) {
        ctors = baseClass.__ctors__;
        if (ctors) {
            ctors = ctors.slice();
        }
    }
    else if (baseClass) {
        ctors = [baseClass];
    }
    // append subclass user constructors
    if (ctors) {
        if (constructor) {
            ctors.push(constructor);
        }
    }
    else if (constructor) {
        ctors = [constructor];
    }
    // create class constructor
    var body;
    if (FIRE_EDITOR) {
        body = '(function ' + normalizeClassName(className) + '(){\n';
    }
    else {
        body = '(function(){\n';
    }
    if (FIRE_EDITOR) {
        body += 'this._observing=false;\n';
    }
    body += 'instantiateProps(this,fireClass);\n';

    // call user constructors
    if (ctors) {
        if (FIRE_EDITOR) {
            console.assert(ctors.length > 0);
        }

        body += 'var cs=fireClass.__ctors__;\n';

        if (useTryCatch) {
            body += 'try{\n';
        }

        if (ctors.length <= 5) {
            for (var i = 0; i < ctors.length; i++) {
                body += '(cs[' + i + ']).apply(this,arguments);\n';
            }
        }
        else {
            body += 'for(var i=0,l=cs.length;i<l;++i){\n';
            body += '(cs[i]).apply(this,arguments);\n}\n';
        }

        if (useTryCatch) {
            body += '}catch(e){\nFire._throw(e);\n}\n';
        }
    }
    body += '})';

    // jshint evil: true
    var fireClass = eval(body);
    // jshint evil: false

    Object.defineProperty(fireClass, '__ctors__', {
        value: ctors || null,
        writable: false,
        enumerable: false
    });
    return fireClass;
}

/**
 * Specially optimized define function only for internal base classes
 *
 * @method _fastDefine
 * @param {string} className
 * @param {function} constructor
 * @param {string[]} serializableFields
 * @private
 */
Fire._fastDefine = function (className, constructor, serializableFields) {
    JS.setClassName(className, constructor);
    constructor.__props__ = serializableFields;
    for (var i = 0; i < serializableFields.length; i++) {
        Fire.attr(constructor, serializableFields[i], { visible: false });
    }
};

module.exports = {
    instantiateProps: instantiateProps,
    define: define
};
