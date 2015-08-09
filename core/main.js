/**
 * @file Primary bot file
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */

(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        modules = {},
        activeModule = {};

    init();

    /**
     * Modules initialization
     */
    function init() {
        var magicWord, module,
            list = [
                'banderavec.module.js', 'compression.module.js', 'help.module.js', 'iitc.module.js',
                'interval.module.js', 'lang.module.js', 'screenshot.module.js', 'stats.module.js'
            ];

        list.forEach(function(fileName) {
            module = require(__dirname + '/' + fileName);
            magicWord = module.initMessage;
            modules[magicWord] = module;
        });

        getUpdates();
    }

    /**
     * Receive updates from telegram
     */
    function getUpdates() {
        telegram
            .getUpdates()
            .then(function(messages) {
                messages.forEach(function(message) {

                    try {
                        processMessage(message);
                    } catch(e) {
                        console.log('Message processing error', e);
                        console.log(e.stack);
                    }
                });

                getUpdates();
            })
            .fail(function() {
                setTimeout(getUpdates, 5000);
            })
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
            // todo replace with i18n
            telegram.sendMessage(chat, 'Thank you for installing me. Send me location to get intel screenshot');
            text = '/language';
        }

        // If user asked for another module
        if (modules[text]) {
            activeModule[chat] = new modules[text](message);
        }

        // If user asked to cancel current action - just remove a module
        else if (text === '/cancel') {
            delete activeModule[chat];

            lang = settings.lang(chat);
            telegram.sendMessage(chat, i18n(lang, 'main', 'cancelled'), null);
        }

        // If user has another active module
        else if (activeModule[chat]) {
            activeModule[chat].onMessage(message);
        }

        // In other case check is it location TODO
        else if (message.location && modules['/screenshot']) {
            activeModule[chat] = new modules['/screenshot'](message);
        }

        // Or maybe user made a mistake (do not reply in groups)
        else if (chat > -1) {
            lang = settings.lang(chat);
            telegram.sendMessage(chat, i18n(lang, 'main', 'unknown_command'), null);
        }

        // Cleanup complete modules
        if (activeModule[chat] && activeModule[chat].complete) {
            delete activeModule[chat];
        }
    }

}());
