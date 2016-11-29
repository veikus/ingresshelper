/**
 * @file Language setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    let languages = app.i18nTexts.lang.title;

    app.modules = app.modules || {};
    app.modules.lang = Lang;

    /**
     * Generate default keyboard markup
     * @return {Object} Inline keyboard markup
     */
    function generateMarkup(chat) {
        let lang = app.settings.lang(chat),
            result = {
                inline_keyboard: []
            };

        Object.keys(languages).forEach(function(key) {
            let text = languages[key];

            result.inline_keyboard.push([{
                text: text,
                callback_data: 'lang::set::' + key
            }]);
        });

        result.inline_keyboard.push([{
            text: app.i18n(lang, 'common', 'homepage'),
            callback_data: 'homepage'
        }]);

        return result;
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Lang(message) {
        let resp,
            chat = message.chat.id,
            lang = app.settings.lang(chat);

        resp = app.i18n(lang, 'lang', 'welcome');
        app.telegram.sendMessage(chat, resp, generateMarkup(chat));
        app.analytics(chat, 'Language list');

        this.complete = true;
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Lang.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase(),
            chat = message.chat.id;

        return (text === '/language@' + app.me.username.toLowerCase()) || (text === '/language');
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    Lang.onCallback = function (cb) {
        let resp, lang,
            chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [];

        switch (data[1]) {
            case 'start':
                lang = app.settings.lang(chat);

                app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'lang', 'welcome'), generateMarkup(chat));
                app.analytics(chat, 'Language list');
                break;

            case 'set':
                lang = data[2];

                if (!lang || !languages[lang]) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect language value', 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));

                } else {
                    app.settings.lang(chat, lang);
                    resp = [
                        app.i18n(lang, 'lang', 'saved'),
                        app.i18n(lang, 'lang', 'help_us'),
                        app.i18n(lang, 'common', 'home_screen_title')
                    ].join('\n\n');

                    app.telegram.updateMessage(chat, messageId, resp, app.getHomeMarkup(chat));
                    app.analytics(chat, 'Language set', { lang: lang });
                    app.analytics.updateUser(chat, { lang: lang });
                }
                break;

            default:
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
                app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
        }
    };
}());
