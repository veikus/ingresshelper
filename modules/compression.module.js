/**
 * @file Compression setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.modules = app.modules || {};
    app.modules.compression = Compression;

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Compression(message) {
        let resp, markup,
            chat =  message.chat.id,
            lang = app.settings.lang(chat);

        markup = {
            inline_keyboard: [
                [{
                    text: app.i18n(lang, 'compression', 'disable'),
                    callback_data: 'compression::set::0'
                }],
                [{
                    text: app.i18n(lang, 'compression', 'enable'),
                    callback_data: 'compression::set::1'
                }]
            ]
        };

        resp = app.i18n(lang, 'compression', 'welcome');
        app.telegram.sendMessage(chat, resp, markup);

        this.complete = true;
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Compression.initMessage = function(message) {
        let chat = message.chat.id,
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/compression' || text === app.i18n(lang, 'common', 'compression').toLowerCase();
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    Compression.onCallback = function (cb) {
        let chat = cb.message.chat.id,
            lang = app.settings.lang(chat),
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [];

        if (data[1] === 'set') {
            let isOn = !!parseInt(data[2]),
                resp = app.i18n(lang, 'compression', 'saved');

            app.settings.compression(chat, isOn);
            app.telegram.updateMessage(chat, messageId, resp, 'clear_inline');
        } else {
            app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
        }

        app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
    };
}());
