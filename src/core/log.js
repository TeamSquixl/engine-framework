
/**
 * !#en Outputs a message to the Fireball Console (editor) or Web Console (runtime).
 * !#zh 向 Fireball 编辑器控制台或浏览器控制台输出信息。
 * @method log
 * @param {any|string} obj - !#en A JavaScript string containing zero or more substitution strings. !#zh 包含一个或多个替代 string
 * @param {any} ...subst - JavaScript objects with which to replace substitution strings within msg. This gives you additional control over the format of the output.
 */
Fire.log = function () {
    console.log.apply(console, arguments);
};

/**
 * Outputs an informational message to the Fireball Console (editor) or Web Console (runtime).
 * - In Fireball, info is blue.
 * - In Firefox and Chrome, a small "i" icon is displayed next to these items in the Web Console's log.
 * @method info
 * @param {any|string} obj - A JavaScript string containing zero or more substitution strings.
 * @param {any} ...subst - JavaScript objects with which to replace substitution strings within msg. This gives you additional control over the format of the output.
 */
Fire.info = function () {
    (console.info || console.log).apply(console, arguments);
};

/**
 * Outputs a warning message to the Fireball Console (editor) or Web Console (runtime).
 * - In Fireball, warning is yellow.
 * - In Chrome, warning have a yellow warning icon with the message text.
 * @method warn
 * @param {any|string} obj - A JavaScript string containing zero or more substitution strings.
 * @param {any} ...subst - JavaScript objects with which to replace substitution strings within msg. This gives you additional control over the format of the output.
 */
if (console.warn) {
    Fire.warn = function () {
        console.warn.apply(console, arguments);
    };
}
else {
    Fire.warn = function () {
        arguments[0] = ' WARN: ' + arguments[0];
        console.log.apply(console, arguments);
    };
}

/**
 * Outputs an error message to the Fireball Console (editor) or Web Console (runtime).
 * - In Fireball, error is red.
 * - In Chrome, error have a red icon along with red message text.
 * @method error
 * @param {any|string} obj - A JavaScript string containing zero or more substitution strings.
 * @param {any} ...subst - JavaScript objects with which to replace substitution strings within msg. This gives you additional control over the format of the output.
 */
// error会dump call stack，用bind可以避免dump Fire.error自己。
if (console.error) {
    Fire.error = console.error.bind(console);
}
else {
    Fire.error = function () {
        arguments[0] = 'ERROR: ' + arguments[0];
        console.log.apply(console, arguments);
    }
}

/**
 * show error stacks in unit tests
 * @method _throw
 * @param {Error} error
 * @private
 */
Fire._throw = function (error) {
    Fire.error(error.stack || error);
};
