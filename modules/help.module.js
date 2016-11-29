/**
 * @file Help module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.modules = app.modules || {};
    app.modules.help = Help;

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Help(message) {
        this.onMessage(message);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Help.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase();

        return (text === '/help@' + app.me.username.toLowerCase()) || (text === '/help');
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    Help.onCallback = function (cb) {
        let resp, markup,
            chat = cb.message.chat.id,
            lang = app.settings.lang(chat),
            messageId = cb.message.message_id;

        markup = {
            inline_keyboard: [
                [{
                    text: app.i18n(lang, 'common', 'homepage'),
                    callback_data: 'homepage'
                }]
            ]
        };

        resp = [
            app.i18n(lang, 'help', 'line_1'),
            app.i18n(lang, 'help', 'line_2'),
            app.i18n(lang, 'help', 'line_3'),
            app.i18n(lang, 'help', 'line_4'),
        ].join('\n');


        app.telegram.updateMessage(chat, messageId, resp, markup);
        app.analytics(chat, 'Help open');
    };

    /**
     * @param message {object} Telegram message object
     */
    Help.prototype.onMessage = function (message) {
        let chat = message.chat.id,
            lang = app.settings.lang(chat),
            resp = [];

        resp.push(app.i18n(lang, 'help', 'line_1'));
        resp.push(app.i18n(lang, 'help', 'line_2'));
        resp.push(app.i18n(lang, 'help', 'line_3'));
        resp.push(app.i18n(lang, 'help', 'line_4'));

        this.complete = true;
        app.telegram.sendMessage(chat, resp.join('\n'), app.getHomeMarkup(chat));
        app.analytics(chat, 'Help open');
    };
}());
