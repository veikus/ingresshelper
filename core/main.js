/**
 * @file Primary bot file
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    var modulesArray = [],
        activeModule = {};

    if (app.config.telegramKey === 'YOUR_TOKEN_HERE') {
        alert('Telegram key is not set. Please update "core/config.js" file and restart extension (or browser).');
        return;
    }

    app.getHomeMarkup = getHomeMarkup;
    window.onload = init;

    /**
     * Modules initialization
     */
    function init() {
        Object.keys(app.modules).forEach(function(name) {
            modulesArray.push(app.modules[name]);
        });

        getUpdates();
    }

    /**
     * Receive updates from telegram
     */
    function getUpdates() {
        app.telegram.getUpdates(function(data) {
            if (!data) {
                setTimeout(getUpdates, 5000);
                return;
            }

            data.forEach(function(item) {
                if (item.message) {
                    processMessage(item.message);
                }
                else if (item.callback_query) {
                    processCallback(item.callback_query);
                }
            });

            getUpdates();
        });
    }

    /**
     * Get home screen markup
     */
    function getHomeMarkup(chat) {
        var markup,
            i18n = app.i18n,
            lang = app.settings.lang(chat);

        // Do not display keyboard in groups
        if (chat < 0) {
            return null;
        }

        markup = {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: []
        };

        markup.keyboard.push([
            i18n(lang, 'common', 'make_screenshot')
        ]);

        markup.keyboard.push([
            i18n(lang, 'common', 'rate_us')
        ]);

        markup.keyboard.push([
            i18n(lang, 'common', 'iitc_setup'),
            i18n(lang, 'common', 'language')
        ]);

        return markup;
    }

    /**
     * Process single message
     * @param message {object} Message from getUpdates
     */
    function processMessage(message) {
        var moduleFound,
            i18n = app.i18n,
            chat = parseInt(message.chat.id), // WebStorm was not sure about type of this variable. It help him a little
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        // If user asked for another module
        modulesArray.forEach(function(module) {
            if (module.initMessage(message)) {
                activeModule[chat] = new module(message);
                moduleFound = true;
            }
        });

        if (moduleFound) {
            // We already made everything above
        }

        // Hack for a new users
        else if (text === '/start') {
            app.telegram.sendMessage(chat, i18n(lang, 'common', 'welcome_message'));
            activeModule[chat] = new app.modules.lang(message);
        }

        // If user asked to cancel current action - just remove a module
        else if (text === '/cancel' || text === i18n(lang, 'common', 'homepage').toLowerCase()) {
            delete activeModule[chat];
            app.telegram.sendMessage(chat, i18n(lang, 'main', 'cancelled'), app.getHomeMarkup(chat));
        }

        // If user has another active module
        else if (activeModule[chat] && activeModule[chat].onMessage) {
            activeModule[chat].onMessage(message);
        }

        // In other case check is it location
        else if (message.location && app.modules.screenshot) {
            activeModule[chat] = new app.modules.screenshot(message);
        }

        // Or maybe user made a mistake (do not reply in groups)
        else if (chat > -1) {
            lang = app.settings.lang(chat);
            app.telegram.sendMessage(chat, i18n(lang, 'main', 'unknown_command'), app.getHomeMarkup(chat));
        }

        // Cleanup complete modules
        if (activeModule[chat] && activeModule[chat].complete) {
            delete activeModule[chat];
        }
    }

    function processCallback(cb) {
        var chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            lang = app.settings.lang(chat),
            data = cb.data && cb.data.split('::'),
            module = data[0];

        if (!data || !module) {
            return;
        }

        if (module === 'lang') {
            delete activeModule[chat]; // Module can break when language will be changed
        }

        if (app.modules[module] && app.modules[module].onCallback) {
            app.modules[module].onCallback(cb);
        } else {
            app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'main', 'unknown_command'), 'clear_inline');
            app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title', app.getHomeMarkup(lang)));
        }
    }
}());
