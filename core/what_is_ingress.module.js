/**
 * @file What is ingress module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var i18n = require(__dirname + '/i18n_extend.js'),
    telegram = require(__dirname + '/telegram.js'),
    settings = require(__dirname + '/settings.js'),
    botan = require('botanio')(61578);

What.initMessage = function (message) {
    var chat = message.chat.id,
        lang = settings.lang(chat),
        text = message.text && message.text.toLowerCase();

    return text === i18n(lang, 'common', 'what_is_ingress_option').toLowerCase();
};

/**
 * @param message {object} Telegram message object
 * @constructor
 */
function What(message) {
    this.onMessage(message);
    botan.track(message, 'What is ingress');
}

/**
 * @param message {object} Telegram message object
 */
What.prototype.onMessage = function (message) {
    var resp,
        chat = message.chat.id,
        lang = settings.lang(chat);

    resp = [
        i18n(lang, 'common', 'what_is_ingress_resp_1'),
        i18n(lang, 'common', 'what_is_ingress_resp_2')
    ].join('\n\n');

    this.complete = true;
    telegram.sendMessage(chat, resp, 'home');
};

module.exports = What;