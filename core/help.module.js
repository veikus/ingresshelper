/**
 * @file Help module
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    app.modules = app.modules || {};
    app.modules.help = Help;

    Help.initMessage = '/help';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Help(message) {
        this.onMessage(message);
    }

    /**
     * @param message {object} Telegram message object
     */
    Help.prototype.onMessage = function (message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            resp = [];

        resp.push(app.i18n(lang, 'help', 'line_1'));
        resp.push(app.i18n(lang, 'help', 'line_2'));
        resp.push(app.i18n(lang, 'help', 'line_3'));
        resp.push(app.i18n(lang, 'help', 'line_4'));

        this.complete = true;
        app.telegram.sendMessage(chat, resp.join('\n'), null);
    };
    
}());
