/**
 * @file Screenshot task creation module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    app.modules = app.modules || {};
    app.modules.screenshot = Screenshot;

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Screenshot(message) {
        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);
        this.location = null;
        this.onMessage(message);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Screenshot.initMessage = function(message) {
        var text = message.text && message.text.toLowerCase();

        return text && text === '/screenshot';
    };

    /**
     * @param message {object} Telegram message object
     */
    Screenshot.prototype.onMessage = function (message) {
        var resp, markup, zoom,
            keyboard = [],
            text = message.text,
            location = message.location;

        keyboard = [
            app.i18n(this.lang, 'interval', 'options_1').split(';'),
            app.i18n(this.lang, 'interval', 'options_2').split(';'),
            app.i18n(this.lang, 'interval', 'options_3').split(';'),
            app.i18n(this.lang, 'interval', 'options_4').split(';')
        ];

        markup = {
            keyboard: keyboard,
            one_time_keyboard: true
        };

        // Step 1
        if (location && location.latitude && location.longitude) {
            this.location = location;
            resp = app.i18n(this.lang, 'screenshot', 'zoom_setup');
            app.telegram.sendMessage(this.chat, resp, markup);
            return;
        } else if (!this.location) {
            resp = app.i18n(this.lang, 'screenshot', 'location_required');
            app.telegram.sendMessage(this.chat, resp, null);
            return;
        }

        // Step 2
        zoom = parseInt(text);
        if (zoom && zoom >= 3 && zoom <= 17) {
            this.complete = true;

            app.taskManager.add({
                chat: this.chat,
                location: this.location,
                zoom: zoom
            });

            resp = app.i18n(this.lang, 'screenshot', 'task_saved');
            app.telegram.sendMessage(this.chat, resp, null);

            // Stats
            if (app.modules.stats) {
                app.modules.stats.trackScreenshot({
                    chat: this.chat,
                    zoom: zoom,
                    location: this.location
                });
            }
        } else {
            resp = app.i18n(this.lang, 'screenshot', 'incorrect_input');
            app.telegram.sendMessage(this.chat, resp, markup);
        }
    };

}());
