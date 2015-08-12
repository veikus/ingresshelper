/**
 * @file Screenshot task creation module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        taskManager = require(__dirname + '/task_manager.js'),
        botan = require('botanio')(61578);

    Screenshot.name = 'screenshot';

    Screenshot.initMessage = function(message) {
        var chat = message.chat.id,
            lang = settings.lang(chat),
            text = message.text;

        return text === '/screenshot';
    };

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Screenshot(message) {
        this.chat = message.chat.id;
        this.lang = settings.lang(this.chat);
        this.location = null;
        this.onMessage(message);
        botan.track(message, 'Screenshot begin');
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
            botan.track(message, 'Screenshot location done');
            return;
        } else if (!this.location) {
            resp = i18n(this.lang, 'screenshot', 'location_required');
            telegram.sendMessage(this.chat, resp, null);
            botan.track(message, 'Screenshot location error');
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
            settings.calculateScreenshotRequest(this.chat);
            botan.track(message, 'Screenshot complete');
        } else {
            resp = i18n(this.lang, 'screenshot', 'incorrect_input');
            telegram.sendMessage(this.chat, resp, markup);
            botan.track(message, 'Screenshot zoom error');
        }
    };

    module.exports = Screenshot;
}());
