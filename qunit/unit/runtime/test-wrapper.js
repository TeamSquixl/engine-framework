module('wrapper');

test('Node', function() {
    var MyNode = Fire.Class();
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper,
        statics: {
        }
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);

    var node = new MyNode();
    var nodeWrapper = Fire(node);

    strictEqual(nodeWrapper.targetN, node, 'target of wrapper');
    strictEqual(nodeWrapper.isScene, false, 'not scene');
});

test('SceneNode', function() {
    var dummyScene;
    var MyScene = Fire.Class();
    var MySceneWrapper = Fire.Class({
        extends: Fire.Runtime.SceneWrapper,
    });
    //Fire.engine.getCurrentSceneNode = function () {
    //    return dummyScene;
    //};

    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);

    dummyScene = new MyScene();
    var dummySceneWrapper = Fire(dummyScene);

    //strictEqual(Fire.engine.getCurrentScene(), dummySceneWrapper, 'could get current scene wrapper');

    strictEqual(dummySceneWrapper.isScene, true, 'isScene');
});

test('root', function() {
    var MyNode = Fire.Class({
        constructor: function () {
            this.parent = null;
        }
    });
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper,
        properties: {
            parentN: {
                get: function () {
                    return this.targetN.parent;
                },
                set: function (value) {
                    this.targetN.parent = value;
                }
            }
        }
    });
    var MyScene = Fire.Class();
    var MySceneWrapper = Fire.Class({
        extends: Fire.Runtime.SceneWrapper,
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);
    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);

    var node = new MyNode();
    var nodeWrapper = Fire(node);
    var node2 = new MyNode();
    var nodeWrapper2 = Fire(node2);
    var scene = new MyScene();
    var sceneWrapper = Fire(scene);

    strictEqual(nodeWrapper.root, nodeWrapper, 'root should be itself if no parent');

    node.parent = node2;
    strictEqual(nodeWrapper.root, nodeWrapper2, 'root should be parent');

    node2.parent = scene;
    strictEqual(nodeWrapper.root, sceneWrapper, 'root should be top most parent(scene)');
});
