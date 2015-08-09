/**
 * @file Easter egg
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var telegram = require(__dirname + '/telegram.js');

    Banderavec.initMessage = 'Слава Україні!';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Banderavec(message) {
        this.chat = message.chat.id;
        this.complete = true;

        telegram.sendMessage(this.chat, 'Героям слава!', null);
    }

    /**
     * @param message {object} Telegram message object
     */
    Banderavec.prototype.onMessage = function (message) {};


    module.exports = Banderavec;
}());