/**
 * @file Help module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
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
        var text = message.text && message.text.toLowerCase();

        return text && text === '/help';
    };

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
        app.telegram.sendMessage(chat, resp.join('\n'), app.getHomeMarkup(chat));
    };
    
}());
