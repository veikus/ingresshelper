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

    function getInitMarkup(chat) {
        let keyboard = [],
            lang = app.settings.lang(chat);

        keyboard.push([{
            text: app.i18n(lang, 'common', 'homepage'),
            callback_data: 'homepage'
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
                    callback_data: 'homepage'
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

    function createRequest(message) {
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
            let id = createRequest(message);
            app.telegram.sendMessage(chat, app.i18n(lang, 'screenshot', 'zoom_setup'), getZoomMarkup(chat, id));

        } else {
            let resp = [
                app.i18n(lang, 'screenshot', 'location_required'),
                app.i18n(lang, 'common', 'location_help')
            ].join('\n\n');

            app.telegram.sendMessage(chat, resp, getInitMarkup(chat));
            app.analytics(chat, 'Screenshot open');
        }

        this.complete = true;
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Screenshot.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase();

        return (text === '/screenshot@' + app.me.username.toLowerCase()) || (text === '/screenshot');
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    Screenshot.onCallback = function (cb) {
        let resp,
            chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [],
            lang = app.settings.lang(chat);

        switch (data[1]) {
            case 'start':
                resp = [
                    app.i18n(lang, 'screenshot', 'location_required'),
                    app.i18n(lang, 'common', 'location_help')
                ].join('\n\n');

                app.telegram.updateMessage(chat, messageId, resp, getInitMarkup(chat));
                app.analytics(chat, 'Screenshot open');
                break;

            case 'setZoom':
                let id = data[2],
                    zoom = parseInt(data[3]);

                if (!id || !requests[id]) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect id', 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));

                } else if (requests[id].chat !== chat) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Permission denied', 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));

                } else if (!zoom || zoom < 3 && zoom > 17) {
                    app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect zoom', 'clear_inline');
                    app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));

                } else {
                    let request = requests[id];
                    request.zoom = zoom;
                    request.messageId = messageId;
                    onRequestsChanged();

                    resp = [
                        app.i18n(lang, 'screenshot', 'task_saved'),
                        app.i18n(lang, 'common', 'home_screen_title')
                    ].join('\n\n');

                    app.settings.setCustomProperty(chat, 'lastActivity', new Date().getTime());
                    app.taskManager.add(request);
                    app.telegram.updateMessage(chat, messageId, resp, app.getHomeMarkup(chat));

                    // Stats
                    app.analytics(chat, 'Screenshot request', { zoom: zoom });
                    app.analytics.increment(chat, 'requestedScreenshots');

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

                        app.analytics.updateUser(chat, { city: data.city, countryCode: data.country });
                    });
                }
                break;

            default:
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
                app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
        }
    };
}());
