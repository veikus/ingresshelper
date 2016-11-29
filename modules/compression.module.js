/**
 * @file Compression setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.modules = app.modules || {};
    app.modules.compression = Compression;

    function getMarkup(chat) {
        let keyboard = [],
            lang = app.settings.lang(chat);

        keyboard.push([{
            text: app.i18n(lang, 'compression', 'disable'),
            callback_data: 'compression::set::0'
        }]);

        keyboard.push([{
            text: app.i18n(lang, 'compression', 'enable'),
            callback_data: 'compression::set::1'
        }]);

        keyboard.push([{
            text: app.i18n(lang, 'common', 'homepage'),
            callback_data: 'homepage'
        }]);

        return {
            inline_keyboard: keyboard
        }
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Compression(message) {
        let chat =  message.chat.id,
            lang = app.settings.lang(chat);

        app.telegram.sendMessage(chat, app.i18n(lang, 'compression', 'welcome'), getMarkup(chat));
        app.analytics(chat, 'Compression open');
        this.complete = true;
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Compression.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase();

        return (text === '/compression@' + app.me.username.toLowerCase()) || (text === '/compression');
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    Compression.onCallback = function (cb) {
        let resp,
            chat = cb.message.chat.id,
            lang = app.settings.lang(chat),
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [];

        switch (data[1]) {
            case 'start':
                app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'compression', 'welcome'), getMarkup(chat));
                app.analytics(chat, 'Compression open');
                break;

            case 'set':
                let isOn = !!parseInt(data[2]);

                resp = app.i18n(lang, 'compression', 'saved') + '\n\n';
                resp += app.i18n(lang, 'common', 'home_screen_title');

                app.settings.compression(chat, isOn);
                app.telegram.updateMessage(chat, messageId, resp, app.getHomeMarkup(chat));
                app.analytics(chat, 'Compression set', { isOn: isOn });
                break;

            default:
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
                app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
        }
    };
}());
