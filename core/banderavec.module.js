/**
 * @file Easter egg
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    app.modules = app.modules || {};
    app.modules.banderavec = Banderavec;

    Banderavec.initMessage = 'Слава Україні!';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Banderavec(message) {
        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);
        this.complete = true;

        app.telegram.sendMessage(this.chat, 'Героям слава!', null);
    }

    /**
     * @param message {object} Telegram message object
     */
    Banderavec.prototype.onMessage = function (message) {};
}());