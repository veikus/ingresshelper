/**
 * @file IITC setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    var plugins, markup;

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
     * @param message {object} Telegram message object
     * @constructor
     */
    function IITC(message) {
        var resp;

        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);

        markup = {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: this.buildKeyboard()
        };

        resp = app.i18n(this.lang, 'iitc', 'help');
        resp += '\n';
        resp += this.getCurrentStatus();

        app.telegram.sendMessage(this.chat, resp, markup);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    IITC.initMessage = function(message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/iitc' || text === app.i18n(lang, 'common', 'iitc_setup').toLowerCase();
    };

    /**
     * Convert plugins id to plugins urls
     * @static
     * @params plugins {Array} Array of plugins ids
     * @returns {Array} Array of plugin urls
     */
    IITC.idToUrl = function(ids) {
        var result = [];

        Object.keys(plugins).forEach(function(name) {
            var plugin = plugins[name];

            if (ids.indexOf(plugin.id) > -1) {
                result.push(plugin.url);
            }
        });

        return result;
    };

    /**
     * @param message {object} Telegram message object
     */
    IITC.prototype.onMessage = function (message) {
        var index, isEnabled, resp, selectedPlugin,
            text = message.text,
            enabled = app.settings.plugins(this.chat),
            completeMessage = app.i18n(this.lang, 'iitc', 'complete_setup');

        if (completeMessage === text) {
            this.complete = true;
            app.telegram.sendMessage(this.chat, '👍', app.getHomeMarkup(chat)); // thumbs up
        } else if (plugins[text]) {
            selectedPlugin = plugins[text];
            index = enabled.indexOf(selectedPlugin.id);
            isEnabled = index > -1;

            if (isEnabled) {
                if (selectedPlugin.id === 'iitc') {
                    enabled = [];
                } else {
                    enabled.splice(index, 1);
                }
            } else {
                if (enabled.length === 0 && selectedPlugin !== plugins.IITC) {
                    enabled.push(plugins.IITC.id);
                }

                enabled.push(selectedPlugin.id);
            }

            app.settings.plugins(this.chat, enabled);

            resp = this.getCurrentStatus();
            app.telegram.sendMessage(this.chat, resp, markup);

        } else {
            resp = app.i18n(this.lang, 'iitc', 'plugin_not_found');
            app.telegram.sendMessage(this.chat, resp);
        }
    };

    /**
     * Build message with current modules status
     * @returns {String} String with modules names and their statuses
     */
    IITC.prototype.getCurrentStatus = function() {
        var name, plugin, isEnabled,
            result = [],
            enabled = app.settings.plugins(this.chat);

        result.push(app.i18n(this.lang, 'iitc', 'status'));

        for (name in plugins) {
            if (!plugins.hasOwnProperty(name)) {
                continue;
            }

            plugin = plugins[name];
            isEnabled = enabled.indexOf(plugin.id) > -1;

            if (isEnabled) {
                result.push('✅' + name);
            } else {
                result.push('❎' + name);
            }
        }

        return result.join('\n');
    };

    /**
     * Build keyboard with modules list
     * @returns {Array} Array ready to use in markup
     */
    IITC.prototype.buildKeyboard = function() {
        var result = [];

        Object.keys(plugins).forEach(function(name) {
            result.push([name]);
        });

        result.push([app.i18n(this.lang, 'iitc', 'complete_setup')]);

        return result;
    };

}());
