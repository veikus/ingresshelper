/**
 * @file Donate module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var i18n = require(__dirname + '/i18n_extend.js'),
    telegram = require(__dirname + '/telegram.js'),
    settings = require(__dirname + '/settings.js'),
    botan = require('botanio')(61578);

Donate.initMessage = function (message) {
    var chat = message.chat.id,
        lang = settings.lang(chat),
        text = message.text && message.text.toLowerCase();

    return text === i18n(lang, 'common', 'donate').toLowerCase();
};

/**
 * @param message {object} Telegram message object
 * @constructor
 */
function Donate(message) {
    this.chat = message.chat.id;
    this.lang = settings.lang(this.chat);

    this.onMessage(message);
}

/**
 * @param message {object} Telegram message object
 */
Donate.prototype.onMessage = function (message) {
    var resp;

    resp = [
        i18n(this.lang, 'common', 'donate_response'),
        i18n(this.lang, 'common', 'donate_response_yandex')
    ].join('\n\n');

    telegram.sendMessage(this.chat, resp, 'home');
    botan.track(message, 'Donate');
};

module.exports = Donate;