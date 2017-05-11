/**
 * @module Fire
 */

var getChildrenN = function (node) {
    var wrapper = Fire(node);
    var childrenN = wrapper.childrenN;
    if (wrapper.constructor.canHaveChildrenInEditor) {
        return {
            name: wrapper.name,
            id: wrapper.uuid,
            children: childrenN.length > 0 ? childrenN.map(getChildrenN) : null
        };
    }
    else {
        return {
            name: wrapper.name,
            id: wrapper.uuid,
            children: [],
            canHaveChildren: false
        };
    }
};

/**
 * @method getHierarchyDump
 * @return {object[]}
 */
Editor.getHierarchyDump = function () {
    var root = Fire.engine.getCurrentSceneN();
    var children = Fire(root).childrenN;
    return children.map(getChildrenN);
};

module.exports = Editor.getHierarchyDump;
