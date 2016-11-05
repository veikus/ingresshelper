/**
 * @file Language setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    var languages = app.i18nTexts.lang.title,
        markup = generateMarkup();

    app.modules = app.modules || {};
    app.modules.lang = Lang;

    /**
     * Generate default keyboard markup
     * @return {Object} Inline keyboard markup
     */
    function generateMarkup() {
        var result = {
                inline_keyboard: []
            };

        Object.keys(languages).forEach(function(key) {
            var text = languages[key];

            result.inline_keyboard.push([{
                text: text,
                callback_data: 'lang::set::' + key
            }]);
        });

        return result;
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Lang(message) {
        var resp,
            chat = message.chat.id,
            lang = app.settings.lang(chat);

        resp = app.i18n(lang, 'lang', 'welcome');
        app.telegram.sendMessage(chat, resp, markup);

        this.complete = true;
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
     * @static
     * @param cb {object} Telegram callback object
     */
    Lang.onCallback = function (cb) {
        var resp, lang,
            chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [];

        if (data[1] === 'set') {
            lang = data[2];

            if (!lang || !languages[lang]) {
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect language value', 'clear_inline');
            } else {
                app.settings.lang(chat, lang);
                resp = app.i18n(lang, 'lang', 'saved') + '\n\n';
                resp += app.i18n(lang, 'lang', 'help_us');

                app.telegram.updateMessage(chat, messageId, resp, 'clear_inline');
            }
        } else {
            app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
        }

        app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
    };
}());
