/**
 * @file History module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.modules = app.modules || {};
    app.modules.history = History;

    function getMarkup(chat) {
        let markup,
            history = app.settings.getHistory(chat),
            lang = app.settings.lang(chat);

        markup = {
            inline_keyboard: []
        };

        history.forEach(function(record) {
            markup.inline_keyboard.push([{
                text: record.name + ' [' + record.zoom + ']',
                callback_data: ['history', 'goTo', record.id].join('::')
            }]);
        });

        markup.inline_keyboard.push([{
            text: app.i18n(lang, 'common', 'homepage'),
            callback_data: 'homepage'
        }]);

        return markup;
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function History(message) {
        let resp,
            chat = message.chat.id,
            lang = app.settings.lang(chat),
            history = app.settings.getHistory(chat);

        this.complete = true;

        if (!history.length) {
            app.telegram.sendMessage(chat, app.i18n(lang, 'history', 'no_data'), app.getHomeMarkup(chat));
        } else {
            resp = app.i18n(lang, 'history', 'title').replace('%n', history.length);
            app.telegram.sendMessage(chat, resp, getMarkup(chat));
            app.analytics(chat, 'History open', { count: history.length });
        }
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    History.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase();

        return (text === '/history@' + app.me.username.toLowerCase()) || (text === '/history');
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    History.onCallback = function(cb) {
        let params, resp,
            chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            lang = app.settings.lang(chat),
            history = app.settings.getHistory(chat),
            data = cb.data && cb.data.split('::') || [];

        switch (data[1]) {
            case 'start':
                if (!history.length) {
                    resp = [
                        app.i18n(lang, 'history', 'no_data'),
                        app.i18n(lang, 'common', 'home_screen_title')
                    ].join('\n\n');

                    app.telegram.updateMessage(chat, messageId, resp, app.getHomeMarkup(chat));
                } else {
                    resp = app.i18n(lang, 'history', 'title').replace('%n', history.length);
                    app.telegram.sendMessage(chat, resp, getMarkup(chat));
                    app.analytics(chat, 'History open', { count: history.length });
                }

                app.telegram.updateMessage(chat, messageId, resp, getMarkup(chat));
                break;

            case 'goTo':
                let recordId = data[2];

                if (!recordId) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: No record id', 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));

                } else {
                    history.forEach(function(item) {
                        if (item.id === recordId) {
                            params = item;
                        }
                    });

                    if (!params) {
                        app.telegram.updateMessage(chat, messageId, 'ERROR: Record not found', 'clear_inline');
                        app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
                        return;
                    }

                    app.taskManager.add({
                        chat: chat,
                        zoom: params.zoom,
                        location: {
                            latitude: params.location.latitude,
                            longitude: params.location.longitude
                        }
                    });

                    app.settings.setCustomProperty(chat, 'lastActivity', new Date().getTime());
                    app.settings.moveUpHistoryRecord(chat, params.id);
                    app.telegram.updateMessage(chat, messageId, app.i18n(this.lang, 'screenshot', 'task_saved'), 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
                    app.analytics(chat, 'History go to', { count: history.length });
                }
                break;
        }
    }
}());
