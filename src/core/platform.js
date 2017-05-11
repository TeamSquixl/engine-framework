
var platform = '';
if (typeof _FireSettings !== 'undefined' && _FireSettings.platform) {
    platform = _FireSettings.platform;
}

exports.isDistributed = !!platform;

Object.defineProperties(exports, {
    isNative: {
        get: function () {
            return platform.startsWith('native-');
        }
    },
    isNativeDarwin: {
        get: function () {
            return platform === 'native-mac';
        }
    },
    isNativeWin32: {
        get: function () {
            return platform === 'native-win';
        }
    },
    isNativeAndroid: {
        get: function () {
            return platform === 'native-android';
        }
    },
    isNativeIOS: {
        get: function () {
            return platform === 'native-ios';
        }
    },
});
