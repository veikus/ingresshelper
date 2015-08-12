/**
 * @file Help module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        botan = require('botanio')(61578);

    Help.name = 'help';

    Help.initMessage = function(message) {
        var chat = message.chat.id,
            lang = settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/help';
    };

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Help(message) {
        this.onMessage(message);
        botan.track(message, 'Help');
    }

    /**
     * @param message {object} Telegram message object
     */
    Help.prototype.onMessage = function (message) {
        var chat = message.chat.id,
            lang = settings.lang(chat),
            resp = [];

        resp.push(i18n(lang, 'help', 'line_1'));
        resp.push(i18n(lang, 'help', 'line_2'));
        resp.push(i18n(lang, 'help', 'line_3'));
        resp.push(i18n(lang, 'help', 'line_4'));

        this.complete = true;
        telegram.sendMessage(chat, resp.join('\n'), 'home');
    };

    module.exports = Help;
}());
