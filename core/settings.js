/**
 * @file Settings getters/setters
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var localStorage = {
    getItem: function () {
        return undefined;
    },

    setItem: function () {
        return true;
    }
};

/**
 * Chat settings
 * @param id {Number} Chat id
 * @param lang {String} Set user language
 * @returns {String|null} Current language code (or null if not defined)
 */
module.exports.lang = function (id, lang) {
    var settings = localStorage.getItem('settings__chat_' + id);

    if (settings) {
        settings = JSON.parse(settings);
    } else {
        settings = {};
    }

    if (lang) {
        settings.language = lang;
        localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
    }

    return settings && settings.language || null;
};

/**
 * Compression settings
 * @param id {Number} Chat id
 * @param value {Boolean} Set compression value
 * @returns {Boolean} Value of compression setting
 */
module.exports.compression = function (id, value) {
    var settings = localStorage.getItem('settings__chat_' + id);

    if (settings) {
        settings = JSON.parse(settings);
    } else {
        settings = {};
    }

    if (typeof (value) === 'boolean') {
        settings.compression = value;
        localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
    }

    return settings && settings.hasOwnProperty('compression') ? settings.compression : true;
};

/**
 * Plugins settings
 * @param id {Number} Chat id
 * @param value {Array} Set new plugins list
 * @returns {Array} Enabled plugins list
 */
module.exports.plugins = function (id, value) {
    var settings = localStorage.getItem('settings__chat_' + id);

    if (settings) {
        settings = JSON.parse(settings);
    } else {
        settings = {};
    }

    if (value) {
        settings.plugins = value;
        localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
    }

    return settings && settings.plugins || [];
};