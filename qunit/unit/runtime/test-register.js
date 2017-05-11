module('register');

test('basic', function() {
    var MyNode = Fire.Class();
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);

    strictEqual(Fire.getWrapperType(MyNode), MyNodeWrapper, 'getWrapperType should return registered wrapper type');

    var node = new MyNode();
    var wrapper = Fire(node);
    ok(wrapper instanceof MyNodeWrapper, 'Fire should create registered wrapper');
    strictEqual(Fire(node), wrapper, 'Fire should return created registered wrapper');

    strictEqual(wrapper.targetN, node, 'wrapper target should be node');

    //var mixinOpt = Fire.getMixinOptions();
    //ok(mixinOpt, 'has default mixin options');
    //
    //var newMixinOpt = {};
    //Fire.Runtime.registerMixin(newMixinOpt);
    //strictEqual(Fire.getMixinOptions(), newMixinOpt, 'can get registered mixin options');
    //
    //// restore
    //Fire.Runtime.registerMixin(mixinOpt);
});

//test('Fire.SceneWrapperImpl', function() {
//    var MyScene = Fire.Class();
//    var MySceneWrapper = Fire.Class({
//        extends: Fire.Runtime.SceneWrapper
//    });
//    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);
//
//    strictEqual(Fire.SceneWrapperImpl, MySceneWrapper, 'Fire.SceneWrapperImpl should return registered SceneWrapper');
//});
