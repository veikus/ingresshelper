/**
 * @file Compression setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    app.modules = app.modules || {};
    app.modules.compression = Compression;

    Compression.initMessage = '/compression';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Compression(message) {
        var resp, markup;

        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);

        markup = {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: [
                [app.i18n(this.lang, 'compression', 'disable')],
                [app.i18n(this.lang, 'compression', 'enable')]
            ]
        };

        resp = app.i18n(this.lang, 'compression', 'welcome');
        app.telegram.sendMessage(this.chat, resp, markup);
    }

    /**
     * @param message {object} Telegram message object
     */
    Compression.prototype.onMessage = function (message) {
        var resp, offOption, onOption,
            text = message.text;

        offOption = app.i18n(this.lang, 'compression', 'disable');
        onOption = app.i18n(this.lang, 'compression', 'enable');

        if (text === offOption) {
            app.settings.compression(this.chat, false);
            this.complete = true;
        } else if (text === onOption) {
            app.settings.compression(this.chat, true);
            this.complete = true;
        }

        if (this.complete) {
            resp = app.i18n(this.lang, 'compression', 'saved');
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = app.i18n(this.lang, 'compression', 'wrong_input');
            app.telegram.sendMessage(this.chat, resp);
        }
    };

}());
