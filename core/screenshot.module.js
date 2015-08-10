/**
 * @file Screenshot task creation module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        taskManager = require(__dirname + '/task_manager.js');

    Screenshot.initMessage = '/screenshot';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Screenshot(message) {
        this.chat = message.chat.id;
        this.lang = settings.lang(this.chat);
        this.location = null;
        this.onMessage(message);
    }

    /**
     * @param message {object} Telegram message object
     */
    Screenshot.prototype.onMessage = function (message) {
        var resp, markup, zoom, keyboard,
            text = message.text,
            location = message.location;

        keyboard = [
            i18n(this.lang, 'interval', 'options_1').split(';'),
            i18n(this.lang, 'interval', 'options_2').split(';'),
            i18n(this.lang, 'interval', 'options_3').split(';'),
            i18n(this.lang, 'interval', 'options_4').split(';')
        ];

        markup = {
            keyboard: keyboard,
            one_time_keyboard: true
        };

        // Step 1
        if (location && location.latitude && location.longitude) {
            this.location = location;
            resp = i18n(this.lang, 'screenshot', 'zoom_setup');
            telegram.sendMessage(this.chat, resp, markup);
            return;
        } else if (!this.location) {
            resp = i18n(this.lang, 'screenshot', 'location_required');
            telegram.sendMessage(this.chat, resp, null);
            return;
        }

        // Step 2
        zoom = parseInt(text);
        if (zoom && zoom >= 3 && zoom <= 17) {
            this.complete = true;

            taskManager.add({
                chat: this.chat,
                latitude: this.location.latitude,
                longitude: this.location.longitude,
                zoom: zoom
            });

            resp = i18n(this.lang, 'screenshot', 'task_saved');
            telegram.sendMessage(this.chat, resp, null);

            // Stats
            // TODO: Replace with db record
            //if (app.modules.stats) {
            //    app.modules.stats.trackScreenshot({
            //        chat: this.chat,
            //        zoom: zoom,
            //        location: this.location
            //    });
            //}
        } else {
            resp = i18n(this.lang, 'screenshot', 'incorrect_input');
            telegram.sendMessage(this.chat, resp, markup);
        }
    };

    module.exports = Screenshot;
}());
