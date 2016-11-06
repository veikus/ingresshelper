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
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/screenshot' || text === app.i18n(lang, 'common', 'make_screenshot').toLowerCase();
    };

    /**
     * @param message {object} Telegram message object
     */
    Screenshot.prototype.onMessage = function (message) {
        var resp, zoom,
            that = this,
            text = message.text,
            location = message.location;

        // Step 1
        if (location && location.latitude && location.longitude) {
            this.location = location;
            resp = app.i18n(this.lang, 'screenshot', 'zoom_setup');
            app.telegram.sendMessage(this.chat, resp, this.getZoomMarkup());
            return;
        } else if (!this.location) {
            resp = [
                app.i18n(this.lang, 'screenshot', 'location_required'),
                app.i18n(this.lang, 'common', 'location_help')
            ].join('\n\n');

            app.telegram.sendMessage(this.chat, resp, this.getInitMarkup());
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
            app.telegram.sendMessage(this.chat, resp, app.getHomeMarkup(this.chat));

            // Stats
            if (app.modules.stats) {
                app.modules.stats.trackScreenshot({
                    chat: this.chat,
                    zoom: zoom,
                    location: this.location
                });
            }

            // Get location name and save it to history
            app.geocoder(this.lang, this.location, function(data) {
                if (!data) {
                    return;
                }

                app.settings.addToHistory(that.chat, {
                    location: that.location,
                    name: data.name,
                    city: data.city,
                    countryCode: data.country,
                    zoom: zoom
                });
            });

        } else {
            resp = app.i18n(this.lang, 'screenshot', 'incorrect_input');
            app.telegram.sendMessage(this.chat, resp);
        }
    };

    Screenshot.prototype.getInitMarkup = function() {
        var keyboard = [];

        if (this.chat > 0) {
            keyboard.push([{ text: app.i18n(this.lang, 'screenshot', 'send_location'), request_location: true }]);
        }

        keyboard.push([ app.i18n(this.lang, 'common', 'homepage') ]);

        return {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: keyboard
        };
    };

    Screenshot.prototype.getZoomMarkup = function() {
        return {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: [
                app.i18n(this.lang, 'interval', 'options_1').split(';'),
                app.i18n(this.lang, 'interval', 'options_2').split(';'),
                app.i18n(this.lang, 'interval', 'options_3').split(';'),
                app.i18n(this.lang, 'interval', 'options_4').split(';'),
                [ app.i18n(this.lang, 'common', 'homepage') ]
            ]
        };
    };

}());
