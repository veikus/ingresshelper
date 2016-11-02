/**
 * @file Language setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    var languages,
        markup = {};

    app.modules = app.modules || {};
    app.modules.lang = Lang;

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
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Lang.initMessage = function(message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/language' || text === app.i18n(lang, 'common', 'language').toLowerCase();
    };

    /**
     * @param message {object} Telegram message object
     */
    Lang.prototype.onMessage = function (message) {
        var resp,
            lang = this.lang,
            text = message.text;

        if (languages[text]) {
            lang = languages[text];
            resp = app.i18n(lang, 'lang', 'saved') + '\n\n';
            resp += app.i18n(lang, 'lang', 'help_us');

            app.settings.lang(this.chat, lang);
            app.telegram.sendMessage(this.chat, resp, app.getHomeMarkup(this.chat));

            this.complete = true;
        } else {
            resp = app.i18n(this.lang, 'lang', 'incorrect_language');
            app.telegram.sendMessage(this.chat, resp);
        }
    };

    // Markup generator
    languages = {};

    (function() {
        var all = app.i18nTexts.lang.title;

        Object.keys(all).forEach(function(key) {
            var val = all[key];
            languages[val] = key;
        });
    }());

    markup.one_time_keyboard = true;
    markup.resize_keyboard = true;
    markup.keyboard = [];

    Object.keys(languages).forEach(function(lang) {
        markup.keyboard.push([lang]);
    });
}());
