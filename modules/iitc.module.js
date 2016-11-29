/**
 * @file IITC setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    let plugins;

    app.modules = app.modules || {};
    app.modules.iitc = IITC;

    plugins = {
        'IITC': {
            id: 'iitc',
            url: location.origin + '/iitc/total-conversion-build.user.js'
        },
        'Missions': {
            id: 'missions',
            url: location.origin + '/iitc/missions.user.js'
        },
        'Show portal weakness': {
            id: 'portalWeakness',
            url: location.origin + '/iitc/show-portal-weakness.user.js'
        },
        'Player tracker': {
            id: 'playerTracker',
            url: location.origin + '/iitc/player-tracker.user.js'
        },
        'Portal names': {
            id: 'portalNames',
            url: location.origin + '/iitc/portal-names.user.js'
        },
        'Portal level numbers': {
            id: 'portalLevels',
            url: location.origin + '/iitc/portal-level-numbers.user.js'
        },
        'Show the direction of links': {
            id: 'linksDirection',
            url: location.origin + '/iitc/link-show-direction.user.js'
        },
        'Fix Google Map offset in China': {
            id: 'chinaFix',
            url: location.origin + '/iitc/fix-googlemap-china-offset.user.js'
        }
    };

    /**
     * Build keyboard with modules list
     * @returns {Array} Array ready to use in markup
     */
    function buildMarkup(chat) {
        let result = [],
            enabled = app.settings.plugins(chat),
            lang = app.settings.lang(chat);

        Object.keys(plugins).forEach(function(name) {
            let plugin = plugins[name],
                isEnabled = enabled.indexOf(plugin.id) > -1;

            result.push([{
                text: (isEnabled ? '✅' : '❎') + name,
                callback_data: 'iitc::switch::' + plugins[name].id
            }]);
        });

        result.push([{
            text: app.i18n(lang, 'iitc', 'complete_setup'),
            callback_data: 'homepage'
        }]);

        return {
            inline_keyboard: result
        };
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function IITC(message) {
        let chat = message.chat.id,
            lang = app.settings.lang(chat);

        app.telegram.sendMessage(chat, app.i18n(lang, 'iitc', 'help'), buildMarkup(chat));
        app.analytics(chat, 'IITC open');
        this.complete = true;
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    IITC.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase();

        return (text === '/iitc@' + app.me.username.toLowerCase()) || (text === '/iitc');
    };

    /**
     * Convert plugins id to plugins urls
     * @static
     * @params plugins {Array} Array of plugins ids
     * @returns {Array} Array of plugin urls
     */
    IITC.idToUrl = function(ids) {
        let result = [];

        Object.keys(plugins).forEach(function(name) {
            let plugin = plugins[name];

            if (ids.indexOf(plugin.id) > -1) {
                result.push(plugin.url);
            }
        });

        return result;
    };

    /**
     * Validate plugin id
     * @static
     * @param id {String} Plugin id
     */
    IITC.validateId = function(id) {
        let isValid = false;

        Object.keys(plugins).forEach(function(name) {
            let plugin = plugins[name];

            if (plugin.id === id) {
                isValid = true;
            }
        });

        return isValid;
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    IITC.onCallback = function (cb) {
        let chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [],
            lang = app.settings.lang(chat);

        switch (data[1]) {
            case 'start':
                app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'iitc', 'help'), buildMarkup(chat));
                app.analytics(chat, 'IITC open');
                break;

            case 'switch':
                let id = data[2];

                if (!id || !IITC.validateId(id)) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect id value', 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));

                } else {
                    let enabled = app.settings.plugins(chat),
                        index = enabled.indexOf(id),
                        isEnabled = index > -1;

                    if (isEnabled) {
                        if (id === 'iitc') {
                            enabled = [];
                        } else {
                            enabled.splice(index, 1);
                        }
                    } else {
                        if (enabled.length === 0 && id !== plugins.IITC.id) {
                            enabled.push(plugins.IITC.id);
                        }

                        enabled.push(id);
                    }

                    app.settings.plugins(chat, enabled);
                    app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'iitc', 'help'), buildMarkup(chat));
                    app.analytics(chat, 'IITC set', { plugins: enabled.join(';') });
                }
                break;

            default:
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
                app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
        }
    };
}());
