var Fs = !FIRE_TEST && require('fire-fs');
var Url = !FIRE_TEST && require('fire-url');
var JS = Fire.JS;
var Serialize = require('./serialize');

Editor.urlToPath = function (url) {
    return decodeURIComponent(Url.parse(url).pathname);
};

Editor.urlToUuid = function (url) {
    if (Editor.isPageLevel) {
        //if (!Fire.AssetLibrary) {
        //    Fire.error('Editor.urlToUuid is not usable in core process');
        //    return '';
        //}

        // try to parse out of url directly
        var uuid = Fire.AssetLibrary.parseUuidInEditor(url);
        if (uuid) {
            return uuid;
        }
        // try to read from meta file
        var metaPath = Editor.urlToPath(url + '.meta');
        if (Fs.existsSync(metaPath)) {
            try {
                var buffer = Fs.readFileSync(metaPath);
                var meta = JSON.parse(buffer);
                uuid = meta.uuid || '';
            }
            catch (e) {
            }
        }
        //
        return uuid;
    }
    else {
        return Editor.assetdb.urlToUuid(url);
    }
};

Editor.createNode = function (uuid, callback) {
    Fire.AssetLibrary.queryAssetInfo(uuid, function (err, url, isRaw, assetType) {
        if (err) {
            return callback(err);
        }
        else if (!isRaw) {
            Fire.AssetLibrary.loadAsset(uuid, function (err, asset) {
                if (err) {
                    callback(err);
                }
                else if (asset.createNode) {
                    asset.createNode(callback);
                }
                else {
                    callback(new Error('Can not create node from ' + JS.getClassName(assetType)));
                }
            });
        }
        else {
            if (assetType.createNodeByUrl) {
                assetType.createNodeByUrl(url, callback);
            }
            else {
                callback(new Error('Can not create node from ' + JS.getClassName(assetType)));
            }
        }
    });
};
