/**
 * @file Language setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    var languages,
        markup = {};

    app.modules = app.modules || {};
    app.modules.lang = Lang;

    Lang.initMessage = '/language';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Lang(message) {
        var resp;

        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);

        resp = app.i18n(this.lang, 'lang', 'welcome');
        app.telegram.sendMessage(this.chat, resp, markup);
    }

    /**
     * @param message {object} Telegram message object
     */
    Lang.prototype.onMessage = function (message) {
        var resp,
            lang = this.lang,
            text = message.text;

        if (languages[text]) {
            lang = languages[text];
            resp = app.i18n(lang, 'lang', 'saved');
            resp += '\n\n';
            resp += app.i18n(lang, 'lang', 'help_us');

            app.settings.lang(this.chat, lang);

            this.complete = true;
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = app.i18n(this.lang, 'lang', 'incorrect_language');
            app.telegram.sendMessage(this.chat, resp);
        }
    };

    // Markup generator
    languages = {};

    (function() {
        var key, val,
            all = app.i18nTexts.lang.title; // Hack

        for (key in all) {
            if (all.hasOwnProperty(key)) {
                val = all[key];
                languages[val] = key;
            }
        }
    }());

    markup.one_time_keyboard = true;
    markup.resize_keyboard = true;
    markup.keyboard = [];

    Object.keys(languages).forEach(function(lang) {
        markup.keyboard.push([lang]);
    });
}());
