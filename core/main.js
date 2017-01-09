/**
 * @file Primary bot file
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function () {
    let modulesArray = [],
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

        app.telegram.getMe(function(data, err) {
            if (err || !data || !data.ok) {
                alert('getMe() request failed!');
            } else {
                app.me = data.result;
                getUpdates();
            }
        });
    }

    /**
     * Receive updates from telegram
     */
    function getUpdates() {
        app.telegram.getUpdates(function(data) {
            app.watchdog();

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
        let markup,
            i18n = app.i18n,
            lang = app.settings.lang(chat),
            history = app.settings.getHistory(chat);

        if (!chat) {
            console.error('getHomeMarkup(): Empty chat variable');
        }

        markup = {
            inline_keyboard: []
        };

        markup.inline_keyboard.push([
            {
                text: i18n(lang, 'common', 'make_screenshot'),
                callback_data: 'screenshot::start'
            }
        ]);

        if (app.modules.rateUs && app.settings.getReceivedScreenshots(chat) >= 3) {
            markup.inline_keyboard.push([
                {
                    text: i18n(lang, 'common', 'rate_us'),
                    callback_data: 'rateUs::start'
                }
            ]);
        }

        if (app.modules.history && history.length > 0) {
            markup.inline_keyboard.push([
                {
                    text: i18n(lang, 'common', 'history'),
                    callback_data: 'history::start'
                }
            ]);
        }

        markup.inline_keyboard.push([
            {
                text: i18n(lang, 'common', 'iitc_setup'),
                callback_data: 'iitc::start'
            },
            {
                text: i18n(lang, 'common', 'compression'),
                callback_data: 'compression::start'
            }
        ]);

        markup.inline_keyboard.push([
            {
                text: i18n(lang, 'common', 'language'),
                callback_data: 'lang::start'
            },
            {
                text: i18n(lang, 'common', 'help'),
                callback_data: 'help::start'
            }
        ]);

        return markup;
    }

    /**
     * Process single message
     * @param message {object} Message from getUpdates
     */
    function processMessage(message) {
        let moduleFound,
            i18n = app.i18n,
            chat = parseInt(message.chat.id), // WebStorm was not sure about type of this variable. It help him a little
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        if (chat > 0) {
            app.analytics.setBaseDetails(chat, {
                $name: message.chat.username,
                firstName: message.chat.first_name,
                lastName: message.chat.last_name,
                username: message.chat.username
            });
        } else {
            app.analytics.setBaseDetails(chat, {
                $name: message.chat.title,
                chatTitle: message.chat.title,
                username: message.chat.username
            });
        }

        // If user asked for another module
        modulesArray.forEach(function (module) {
            if (module.initMessage(message)) {
                activeModule[chat] = new module(message);
                moduleFound = true;
            }
        });

        if (moduleFound) {
            // We already made everything above
        }

        // Hack for a new users
        else if (text && text.indexOf('/start') === 0) {
            app.analytics(chat, 'Start');
            app.telegram.sendMessage(chat, i18n(lang, 'common', 'welcome_message'));
            activeModule[chat] = new app.modules.lang(message);
        }

        // If user asked to cancel current action - just remove a module
        else if (text === '/cancel' || text === i18n(lang, 'common', 'homepage').toLowerCase()) {
            delete activeModule[chat];
            app.analytics(chat, 'Cancel');
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

        // Remove old style keyboard
        else if (!app.settings.getCustomProperty(chat, 'keyboardHidden')) {
            app.telegram.sendMessage(chat, 'Updating keyboard', { remove_keyboard: true });
            app.settings.setCustomProperty(chat, 'keyboardHidden', true);

            if (chat > -1) {
                app.telegram.sendMessage(chat, i18n(lang, 'main', 'unknown_command'), app.getHomeMarkup(chat));
            }
        }

        // Or maybe user made a mistake (do not reply in groups)
        else if (chat > -1) {
            app.telegram.sendMessage(chat, i18n(lang, 'main', 'unknown_command'), app.getHomeMarkup(chat));
        }

        // Cleanup complete modules
        if (activeModule[chat] && activeModule[chat].complete) {
            delete activeModule[chat];
        }
    }

    function processCallback(cb) {
        let chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            lang = app.settings.lang(chat),
            data = cb.data && cb.data.split('::'),
            module = data[0];

        if (!data || !module) {
            return;
        }

        if (module === 'cancel') {
            app.telegram.updateMessage(chat, messageId, '👍', 'clear_inline');
            app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
            delete activeModule[chat];
            return;
        }

        if (module === 'lang') {
            delete activeModule[chat]; // Module can break when language will be changed
        }

        if (app.modules[module] && app.modules[module].onCallback) {
            app.modules[module].onCallback(cb);
        } else {
            app.telegram.updateMessage(chat, messageId, 'ERROR: Module not found', 'clear_inline');
            app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
        }
    }
}());
