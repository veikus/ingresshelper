/**
 * @file Settings getters/setters
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    app.settings = {};

    /**
     * Chat settings
     * @param id {Number} Chat id
     * @param lang {String} Set user language
     * @returns {String|null} Current language code (or null if not defined)
     */
    app.settings.lang = function(id, lang) {
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
    app.settings.compression = function(id, value) {
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
    app.settings.plugins = function(id, value) {
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
}());