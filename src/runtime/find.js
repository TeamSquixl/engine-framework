var NodeWrapper = require('./wrappers/node');

/**
 * Finds a node by hierarchy path, the path is case-sensitive.
 * It will traverse the hierarchy by splitting the path using '/' character.
 * It is recommended to not use this function every frame instead cache the result at startup.
 *
 * @method find
 * @param {string} path
 * @param {RuntimeNode} referenceNode
 * @return {RuntimeNode} the node or null if not found
 */
module.exports = function (path, referenceNode) {
    if (path == null) {
        Fire.error('Argument must be non-nil');
        return null;
    }
    if (!referenceNode) {
        var scene = Fire.engine.getCurrentScene();
        if (!scene) {
            Fire.warn('Can not get current scene.');
            return null;
        }
        referenceNode = scene;
    }
    else if (!(referenceNode instanceof NodeWrapper)) {
        referenceNode = Fire(referenceNode)
    }

    var matchWrapper = referenceNode;
    var startIndex = (path[0] !== '/') ? 0 : 1; // skip first '/'
    var nameList = path.split('/');
    var name = nameList[startIndex];

    // parse path
    for (var n = startIndex; n < nameList.length; n++) {
        name = nameList[n];
        // visit sub nodes
        var children = matchWrapper.childrenN;
        matchWrapper = null;
        for (var t = 0, len = children.length; t < len; ++t) {
            var subWrapper = Fire(children[t]);
            if (subWrapper.name === name) {
                matchWrapper = subWrapper;
                break;
            }
        }
        if (!matchWrapper) {
            return null;
        }
    }

    return matchWrapper && matchWrapper.targetN;
};
