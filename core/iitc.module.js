/**
 * @file IITC setup module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var plugins, markup,
        i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        botan = require('botanio')(61578);

    IITC.initMessage = '/iitc';

    plugins = {
        'IITC': { file: 'total-conversion-build.user.js', id: 'iitc' },
        'Missions': { file: 'missions.user.js', id: 'missions' },
        'Show portal weakness': { file: 'show-portal-weakness.user.js', id: 'portalWeakness' },
        'Player tracker': { file: 'player-tracker.user.js', id: 'playerTracker' },
        'Portal names': { file: 'portal-names.user.js', id: 'portalNames' },
        'Portal level numbers': { file: 'portal-level-numbers.user.js', id: 'portalLevels' },
        'Show the direction of links': { file: 'link-show-direction.user.js', id: 'linkDirections' },
        'Fix Google Map offset in China': { file: 'fix-googlemap-china-offset.user.js', id: 'chinaOffset' }
    };

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function IITC(message) {
        var resp;

        this.chat = message.chat.id;
        this.lang = settings.lang(this.chat);

        markup = {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: this.buildKeyboard()
        };

        resp = i18n(this.lang, 'iitc', 'help');
        resp += '\n';
        resp += this.getCurrentStatus();

        telegram.sendMessage(this.chat, resp, markup);
        botan.track(message, 'IITC');
    }

    /**
     * @param message {object} Telegram message object
     */
    IITC.prototype.onMessage = function (message) {
        var index, isEnabled, plugin, resp, temp,
            text = message.text,
            enabled = settings.plugins(this.chat);

        temp = i18n(this.lang, 'iitc', 'complete_setup');

        if (temp === text) {
            this.complete = true;
            telegram.sendMessage(this.chat, '👍', null); // thumbs up
        } else if (plugins[text]) {
            plugin = plugins[text];
            index = enabled.indexOf(plugin.id);
            isEnabled = index > -1;

            if (isEnabled) {
                if (text === 'IITC') {
                    enabled = [];
                } else {
                    enabled.splice(index, 1);
                }
            } else {
                if (enabled.length === 0 && text !== 'IITC') {
                    enabled.push(plugins.IITC.id);
                }

                enabled.push(plugin.id);
            }

            settings.plugins(this.chat, enabled);

            resp = this.getCurrentStatus();
            telegram.sendMessage(this.chat, resp, markup);
        } else {
            resp = i18n(this.lang, 'iitc', 'plugin_not_found');
            telegram.sendMessage(this.chat, resp);
        }
    };

    /**
     * Build message with current modules status
     * @returns {String} String with modules names and their statuses
     */
    IITC.prototype.getCurrentStatus = function() {
        var name, plugin, isEnabled,
            result = [],
            enabled = settings.plugins(this.chat);

        result.push(i18n(this.lang, 'iitc', 'status'));

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
        var name,
            result = [];

        for (name in plugins) {
            if (!plugins.hasOwnProperty(name)) {
                continue;
            }

            result.push([name]);
        }

        result.push([i18n(this.lang, 'iitc', 'complete_setup')]);

        return result;
    };

    // Convert array of plugins id's to array of filenames
    IITC.idToName = function(list) {
        var result = [];

        Object.keys(plugins).forEach(function(name) {
            var plugin = plugins[name];

            if (list.indexOf(plugin.id) > -1) {
                result.push(plugin.file);
            }
        });

        return result;
    };

    module.exports = IITC;
}());
