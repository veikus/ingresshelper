/**
 * @file Primary bot file
 * @author Artem Veikus artem@veikus.com
 * @version 2.4.0
 */
(function() {
    var modules = {},
        activeModule = {};

    if (app.config.telegramKey === 'YOUR_TOKEN_HERE') {
        alert('Telegram key is not set. Please update "core/config.js" file and restart extension (or browser).');
        return;
    }

    window.onload = init;

    /**
     * Modules initialization
     */
    function init() {
        Object.keys(app.modules).forEach(function(name) {
            var module = app.modules[name],
                magicWord = module.initMessage;

            if (magicWord) {
                modules[magicWord] = module;
            }
        });

        getUpdates();
    }

    /**
     * Receive updates from telegram
     */
    function getUpdates() {
        app.telegram.getUpdates(function(messages) {
            if (messages) {
                messages.forEach(function(message) {
                    processMessage(message);
                });

                getUpdates();
            } else {
                setTimeout(getUpdates, 5000);
            }
        });
    }

    /**
     * Process single message
     * @param message {object} Message from getUpdates
     */
    function processMessage(message) {
        var lang,
            chat = message.chat.id,
            text = message.text;

        // Hack for a new users
        if (text === '/start') {
            app.telegram.sendMessage(chat, 'Thank you for installing me. Send me location to get intel screenshot');
            text = '/language';
        }

        // If user asked for another module
        if (modules[text]) {
            activeModule[chat] = new modules[text](message);
        }

        // If user asked to cancel current action - just remove a module
        else if (text === '/cancel') {
            delete activeModule[chat];

            lang = app.settings.lang(chat);
            app.telegram.sendMessage(chat, app.i18n(lang, 'main', 'cancelled'), null);
        }

        // If user has another active module
        else if (activeModule[chat]) {
            activeModule[chat].onMessage(message);
        }

        // In other case check is it location
        else if (message.location && app.modules.screenshot) {
            activeModule[chat] = new app.modules.screenshot(message);
        }

        // Or maybe user made a mistake (do not reply in groups)
        else if (chat > -1) {
            lang = app.settings.lang(chat);
            app.telegram.sendMessage(chat, app.i18n(lang, 'main', 'unknown_command'), null);
        }

        // Cleanup complete modules
        if (activeModule[chat] && activeModule[chat].complete) {
            delete activeModule[chat];
        }
    }

}());
