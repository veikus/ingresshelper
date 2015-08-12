/**
 * @file Rate us module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var i18n = require(__dirname + '/i18n_extend.js'),
    telegram = require(__dirname + '/telegram.js'),
    settings = require(__dirname + '/settings.js'),
    botan = require('botanio')(61578);

RateUs.initMessage = function (message) {
    var chat = message.chat.id,
        lang = settings.lang(chat),
        text = message.text && message.text.toLowerCase();

    return text === i18n(lang, 'common', 'rate_us').toLowerCase();
};

/**
 * @param message {object} Telegram message object
 * @constructor
 */
function RateUs(message) {
    this.chat = message.chat.id;
    this.lang = settings.lang(this.chat);

    this.onMessage(message);
}

/**
 * @param message {object} Telegram message object
 */
RateUs.prototype.onMessage = function (message) {
    var resp;

    resp = [
        i18n(this.lang, 'main', 'rate_us_1'),
        i18n(this.lang, 'main', 'rate_us_2'),
        i18n(this.lang, 'main', 'rate_us_3')
    ].join('\n');

    telegram.sendMessage(this.chat, resp, 'home');
    botan.track(message, 'Rate us');
};

module.exports = RateUs;