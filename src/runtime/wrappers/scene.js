/**
 * @module Fire.Runtime
 */

var NodeWrapper = require('./node');
var NYI = require('./utils').NYI;

/**
 * You should override:
 * - childrenN
 * - createNode
 * - position
 * - scale
 *
 * You may want to override:
 * - onBeforeSerialize (so that the scene's properties can be serialized in wrapper)
 * - preloadAssets (so that scene can load synchronously)
 *
 * @class SceneWrapper
 * @extends NodeWrapper
 * @constructor
 * @param {RuntimeNode} node - The root node of current stage.
 */
var SceneWrapper = Fire.Class({
    name: 'Fire.Runtime.SceneWrapper',
    extends: NodeWrapper,
    constructor: function () {
        this._dataToDeserialize = null;
    },

    properties: {
        parentN: {
            get: function () {
                return null;
            },
            set: function () {
                if (FIRE_DEV) {
                    Fire.error("Disallow to set scene's parent.");
                }
            }
        },
        scenePosition: {
            get: function () {
                return new Fire.Vec2(0, 0);
            },
            set: function () {
                Fire.error("Disallow to set scene's scenePosition.");
            },
            visible: false
        }
        /**
         * The local position in its parent's coordinate system.
         * This is used to simulate the panning of preview camera in edit mode.
         * @property position
         * @type {Fire.Vec2}
         */
        /**
         * The local scale factor relative to the parent.
         * This is used to simulate the zoom in and out of preview camera in edit mode.
         * @property scale
         * @type {Fire.Vec2}
         */
    },

    /**
     * Preload resources before scene loading.
     * @method preloadAssets
     * @param {Assets[]} assetObjects
     * @param {string[]} rawAssetUrls
     * @param {function} callback
     * @param {string} callback.error
     */
    preloadAssets: function (assetObjects, rawAssetUrls, callback) {
        callback();
    },

    getSiblingIndex: function () {
        return 0;
    },

    setSiblingIndex: function (index) {
        if (FIRE_DEV) {
            if (index !== 0) {
                Fire.error("Disallow to change scene's sibling index.");
            }
        }
    }
});

module.exports = SceneWrapper;
