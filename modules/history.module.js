/**
 * @file History module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    app.modules = app.modules || {};
    app.modules.history = History;

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function History(message) {
        var resp, markup,
            chat = message.chat.id,
            lang = app.settings.lang(chat),
            history = app.settings.getHistory(chat);

        this.complete = true;

        if (!history.length) {
            app.telegram.sendMessage(chat, app.i18n(lang, 'history', 'no_data'), app.getHomeMarkup(chat));
            return;
        }

        markup = {
            inline_keyboard: []
        };

        history.forEach(function(record) {
            markup.inline_keyboard.push([{
                text: record.name,
                callback_data: [
                    'history',
                    record.location.latitude,
                    record.location.longitude,
                    record.zoom
                ].join('::')
            }]);
        });

        markup.inline_keyboard.push([{
            text: app.i18n(lang, 'common', 'homepage'),
            callback_data: 'cancel'
        }]);

        resp = app.i18n(lang, 'history', 'title');
        resp = resp.replace('%n', history.length);
        app.telegram.sendMessage(chat, resp, markup);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    History.initMessage = function(message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/history' || text === app.i18n(lang, 'common', 'history').toLowerCase();
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    History.onCallback = function(cb) {
        var chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            lang = app.settings.lang(chat),
            data = cb.data && cb.data.split('::') || [],
            latitude = data[1],
            longitude = data[2],
            zoom = data[3];

        if (!latitude || latitude < -90 || latitude > 90) {
            app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect latitude', 'clear_inline');
            app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
            return;
        }

        if (!longitude || longitude < -180 || latitude > 180) {
            app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect longitude', 'clear_inline');
            app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
            return;
        }

        if (!zoom || zoom < 3 || zoom > 17) {
            app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect zoom', 'clear_inline');
            app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
            return;
        }

        app.taskManager.add({
            chat: chat,
            zoom: zoom,
            location: {
                latitude: latitude,
                longitude: longitude
            }
        });

        app.telegram.updateMessage(chat, messageId, app.i18n(this.lang, 'screenshot', 'task_saved'), 'clear_inline');
        app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
    }
}());
