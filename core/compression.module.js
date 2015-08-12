/**
 * @file Compression setup module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        botan = require('botanio')(61578);

    Compression.name = 'compression';

    Compression.initMessage = function(message) {
        var chat = message.chat.id,
            lang = settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/compression';
    };

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Compression(message) {
        var resp, markup;

        this.chat = message.chat.id;
        this.lang = settings.lang(this.chat);

        markup = {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: [
                [i18n(this.lang, 'compression', 'disable')],
                [i18n(this.lang, 'compression', 'enable')]
            ]
        };

        resp = i18n(this.lang, 'compression', 'welcome');
        telegram.sendMessage(this.chat, resp, markup);
        botan.track(message, 'Compression');
    }

    /**
     * @param message {object} Telegram message object
     */
    Compression.prototype.onMessage = function (message) {
        var resp, offOption, onOption,
            text = message.text;

        offOption = i18n(this.lang, 'compression', 'disable');
        onOption = i18n(this.lang, 'compression', 'enable');

        if (text === offOption) {
            settings.compression(this.chat, false);
            this.complete = true;
        } else if (text === onOption) {
            settings.compression(this.chat, true);
            this.complete = true;
        }

        if (this.complete) {
            resp = i18n(this.lang, 'compression', 'saved');
            telegram.sendMessage(this.chat, resp, 'home');
        } else {
            resp = i18n(this.lang, 'compression', 'wrong_input');
            telegram.sendMessage(this.chat, resp);
        }
    };

    module.exports = Compression;
}());
