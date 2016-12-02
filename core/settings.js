/**
 * @file Settings getters/setters
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.settings = {};

    /**
     * Chat settings
     * @param id {Number} Chat id
     * @param lang {String=} Set user language
     * @returns {String|null} Current language code (or null if not defined)
     */
    app.settings.lang = function(id, lang) {
        let settings = localStorage.getItem('settings__chat_' + id);

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
        let settings = localStorage.getItem('settings__chat_' + id);

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
     * @param value {Array=} Set new plugins list
     * @returns {Array} Enabled plugins list
     */
    app.settings.plugins = function(id, value) {
        let settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);

            // Clean up old format
            delete settings.plugins;
        } else {
            settings = {};
        }

        if (value) {
            settings.pluginsV2 = value;
            localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
        }

        return settings && settings.pluginsV2 || [];
    };

    /**
     * Requested screenshots counter
     * @param id {Number} Chat id
     * @returns {Number} Requested screenshots
     */
    app.settings.getReceivedScreenshots = function(id) {
        let settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);

            return settings.receivedScreenshots || 0;
        } else {
            return 0;
        }
    };

    /**
     * Increase requested screenshots counter
     * @param id {Number} Chat id
     */
    app.settings.increaseReceivedScreenshots = function(id) {
        let settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        if (settings.receivedScreenshots) {
            ++settings.receivedScreenshots;
        } else {
            settings.receivedScreenshots = 1;
        }

        localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
    };

    /**
     * Save location to history
     * @params id {Number} Chat id
     * @params params {Object}
     * @params params.location {Object} Latitude and longitude
     * @params params.name {String} Location name
     * @params params.city {String} City
     * @params params.countryCode {String} Country code
     * @params params.zoom {Number} Zoom value
     */
    app.settings.addToHistory = function(id, params) {
        let history,
            settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        history = settings.history || [];
        history.unshift({
            id: Math.random().toString(36).substring(7),
            location: params.location,
            name: params.name,
            city: params.city,
            countryCode: params.countryCode,
            zoom: params.zoom
        });

        if (history.length > 20) {
            history.pop();
        }

        settings.history = history;
        localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
    };

    /**
     * Move location to the first place in history list
     * @param chatId {Number} Chat id
     * @param recordId {String} History record id
     * @params {Boolean} Is record exists
     */
    app.settings.moveUpHistoryRecord = function(chatId, recordId) {
        let history, found,
            settings = localStorage.getItem('settings__chat_' + chatId);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        history = settings.history || [];
        history = history.filter(function(record) {
            if (record.id === recordId) {
                found = record;
                return false;
            } else {
                return true;
            }
        });

        if (found) {
            history.unshift(found);
        }

        settings.history = history;
        localStorage.setItem('settings__chat_' + chatId, JSON.stringify(settings));

        return !!found;
    };

    /**
     * Get location history
     * @param id {Number} Chat id
     * @return {Array} History (see addToHistory method for details)
     */
    app.settings.getHistory = function(id) {
        let settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
            return settings.history || [];
        } else {
            return [];
        }
    };

    /**
     * Get custom user property
     * @param id {Number} Chat id
     * @param name {String} Property name
     */
    app.settings.getCustomProperty = function(id, name) {
        if (!name) {
            console.error('getCustomProperty: No property name');
            return null;
        }

        let settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        return settings[name];
    };

    /**
     * Set custom user property
     * @param id {Number} Chat id
     * @param name {String} Property name
     * @param value * Property value
     */
    app.settings.setCustomProperty = function(id, name, value) {
        if (!name) {
            console.error('getCustomProperty: No property name');
            return null;
        }

        let settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        settings[name] = value;
        localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
    }
}());