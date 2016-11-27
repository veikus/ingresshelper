/**
 * @file Screenshot task creation module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    let requests;

    app.modules = app.modules || {};
    app.modules.screenshot = Screenshot;

    init();

    /**
     * Module initialization
     */
    function init() {
        requests = localStorage.getItem('screenshot__requests');

        if (requests) {
            requests = JSON.parse(requests);
        } else {
            requests = {};
        }
    }

    function getInitMarkupForUser(chat) {
        let keyboard = [],
            lang = app.settings.lang(chat);

        keyboard.push([{ text: app.i18n(lang, 'screenshot', 'send_location'), request_location: true }]);
        keyboard.push([ app.i18n(lang, 'common', 'homepage') ]);

        return {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: keyboard
        };
    }

    function getInitMarkupForGroup(chat) {
        let keyboard = [],
            lang = app.settings.lang(chat);

        keyboard.push([{
            text: app.i18n(lang, 'common', 'homepage'),
            callback_data: 'screenshot::cancel'
        }]);

        return {
            inline_keyboard: keyboard
        };
    }

    function getZoomMarkup(chat, id) {
        let lang = app.settings.lang(chat);

        return {
            inline_keyboard: [
                parseLine(app.i18n(lang, 'interval', 'options_1'), id),
                parseLine(app.i18n(lang, 'interval', 'options_2'), id),
                parseLine(app.i18n(lang, 'interval', 'options_3'), id),
                parseLine(app.i18n(lang, 'interval', 'options_4'), id),
                [{
                    text: app.i18n(lang, 'common', 'homepage'),
                    callback_data: 'screenshot::cancel'
                }]
            ]
        };
    }

    function parseLine(data, id) {
        return data.split(';').map(function(option) {
            return {
                text: option,
                callback_data: 'screenshot::setZoom::' + id + '::' + parseInt(option)
            }
        });
    }

    function createTask(message) {
        let chat = message.chat.id,
            location = message.location,
            id = generateId();

        requests[id] = {
            chat: chat,
            location: location
        };
        onRequestsChanged();

        return id;
    }

    function generateId() {
        let id = Math.random().toString(36).substring(7);

        return requests[id] ? generateId() : id;
    }

    function onRequestsChanged() {
        let text = JSON.stringify(requests);
        localStorage.setItem('screenshot__requests', text);
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Screenshot(message) {
        let chat = message.chat.id,
            lang = app.settings.lang(chat),
            location = message.location;

        if (location && location.latitude && location.longitude) {
            let id = createTask(message);
            app.telegram.sendMessage(chat, app.i18n(lang, 'screenshot', 'zoom_setup'), getZoomMarkup(chat, id));

        } else {
            let markup = chat < 0 ? getInitMarkupForGroup(chat) : getInitMarkupForUser(chat);
            let resp = [
                app.i18n(lang, 'screenshot', 'location_required'),
                app.i18n(lang, 'common', 'location_help')
            ].join('\n\n');

            app.telegram.sendMessage(chat, resp, markup);
        }

        this.complete = true;
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
     * @static
     * @param cb {object} Telegram callback object
     */
    Screenshot.onCallback = function (cb) {
        let chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [],
            lang = app.settings.lang(chat);

        switch (data[1]) {
            case 'cancel':
                app.telegram.updateMessage(chat, messageId, '👍', 'clear_inline'); // thumbs up
                break;

            case 'setZoom':
                let id = data[2],
                    zoom = parseInt(data[3]);

                if (!id || !requests[id]) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect id', 'clear_inline');

                } else if (requests[id].chat !== chat) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Permission denied', 'clear_inline');

                } else if (!zoom || zoom < 3 && zoom > 17) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect zoom', 'clear_inline');

                } else {
                    let request = requests[id];
                    request.zoom = zoom;
                    request.messageId = messageId;
                    onRequestsChanged();

                    app.taskManager.add(request);
                    app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'screenshot', 'task_saved'), 'clear_inline');

                    // Stats
                    if (app.modules.stats) {
                        app.modules.stats.trackScreenshot(request);
                    }

                    // Get location name and save it to history
                    app.geocoder(lang, request.location, function(data) {
                        if (!data) {
                            return;
                        }

                        app.settings.addToHistory(chat, {
                            location: request.location,
                            name: data.name,
                            city: data.city,
                            countryCode: data.country,
                            zoom: zoom
                        });
                    });
                }
                break;

            default:
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
        }

        app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
    };
}());
