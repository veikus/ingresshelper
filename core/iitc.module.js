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
        'IITC': 'iitc/total-conversion-build.user.js',
        'Missions': 'iitc/missions.user.js',
        'Show portal weakness': 'iitc/show-portal-weakness.user.js',
        'Player tracker': 'iitc/player-tracker.user.js',
        'Portal names': 'iitc/portal-names.user.js',
        'Portal level numbers': 'iitc/portal-level-numbers.user.js',
        'Show the direction of links': 'iitc/link-show-direction.user.js',
        'Fix Google Map offset in China': 'iitc/fix-googlemap-china-offset.user.js'
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
        var text = message.text && message.text.toLowerCase();

        return text && text === '/iitc';
    };

    /**
     * @param message {object} Telegram message object
     */
    IITC.prototype.onMessage = function (message) {
        var index, isEnabled, url, resp, temp,
            text = message.text,
            enabled = app.settings.plugins(this.chat);

        temp = app.i18n(this.lang, 'iitc', 'complete_setup');

        if (temp === text) {
            this.complete = true;
            app.telegram.sendMessage(this.chat, '👍', null); // thumbs up
        } else if (plugins[text]) {
            url = plugins[text];
            index = enabled.indexOf(url);
            isEnabled = index > -1;

            if (isEnabled) {
                if (text === 'IITC') {
                    enabled = [];
                } else {
                    enabled.splice(index, 1);
                }
            } else {
                if (enabled.length === 0 && url !== plugins.IITC) {
                    enabled.push(plugins.IITC);
                }

                enabled.push(url);
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
        var name, url, isEnabled,
            result = [],
            enabled = app.settings.plugins(this.chat);

        result.push(app.i18n(this.lang, 'iitc', 'status'));

        for (name in plugins) {
            if (!plugins.hasOwnProperty(name)) {
                continue;
            }

            url = plugins[name];
            isEnabled = enabled.indexOf(url) > -1;

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

        result.push([app.i18n(this.lang, 'iitc', 'complete_setup')]);

        return result;
    };

}());
