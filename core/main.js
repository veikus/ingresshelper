var app = {};

(function() {
    var modules = {},
        activeModule = {},
        unknownCommand = {};

    window.onload = init;

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

        // If user asked for another module
        if (modules[text]) {
            activeModule[chat] = new modules[text](message);
        }

        // If user has another active module
        else if (activeModule[chat]) {
            activeModule[chat].onMessage(message);
        }

        // If user asked to cancel current action - just remove a module
        else if (text === '/cancel') {
            delete activeModule[chat];
        }

        // In other case check is it location
        else if (message.location && app.modules.screenshot) {
            activeModule[chat] = new app.modules.screenshot(message);
        }

        // Or maybe user made a mistake
        else {
            lang = app.settings.lang(chat);
            app.telegram.sendMessage(chat, unknownCommand[lang] || unknownCommand.en);
        }


        // Cleanup complete modules
        if (activeModule[chat] && activeModule[chat].complete) {
            delete activeModule[chat];
        }
    }

    // Translation
    unknownCommand.en = 'Unknown command';
    unknownCommand.ru = 'Неизвестная команда';
}());
