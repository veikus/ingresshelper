/**
 * @file Language setup module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var languages,
        i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        markup = {};

    Lang.initMessage = '/language';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Lang(message) {
        var resp;

        this.chat = message.chat.id;
        this.lang = settings.lang(this.chat);

        resp = i18n(this.lang, 'lang', 'welcome');
        telegram.sendMessage(this.chat, resp, markup);
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
            resp = i18n(lang, 'lang', 'saved');
            resp += '\n\n';
            resp += i18n(lang, 'lang', 'help_us');

            settings.lang(this.chat, lang);

            this.complete = true;
            telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = i18n(this.lang, 'lang', 'incorrect_language');
            telegram.sendMessage(this.chat, resp);
        }
    };

    // Markup generator
    languages = i18n.getLanguages();

    markup.one_time_keyboard = true;
    markup.resize_keyboard = true;
    markup.keyboard = [];

    Object.keys(languages).forEach(function(lang) {
        markup.keyboard.push([lang]);
    });

    module.exports = Lang;
}());
