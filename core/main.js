/**
 * @file Primary bot file
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */

(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        modules = [],
        activeModule = {};

    init();

    /**
     * Modules initialization
     */
    function init() {
        var module,
            list = [
                'banderavec.module.js', 'compression.module.js', 'help.module.js', 'iitc.module.js',
                'interval.module.js', 'lang.module.js', 'screenshot.module.js', 'stats.module.js'
            ];

        list.forEach(function(fileName) {
            module = require(__dirname + '/' + fileName);

            modules.push(module);
            modules[module.name] = module;
        });

        settings.init(getUpdates);
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
        var lang, moduleFound,
            chat = message.chat.id,
            text = message.text && message.text.toLowerCase();

        // Save user data
        settings.profile(chat, {
            first_name: message.chat.first_name || '',
            last_name: message.chat.last_name || '',
            title: message.chat.title || '',
            username: message.chat.username || ''
        });

        // If user asked for another module
        modules.forEach(function(module) {
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
            // todo replace with i18n
            telegram.sendMessage(chat, 'Thank you for installing me. Send me location to get intel screenshot');
            text = '/language';
        }

        // If user asked to cancel current action - just remove a module
        else if (text === '/cancel') {
            delete activeModule[chat];

            lang = settings.lang(chat);
            telegram.sendMessage(chat, i18n(lang, 'main', 'cancelled'), 'home');
        }

        // If user has another active module
        else if (activeModule[chat]) {
            activeModule[chat].onMessage(message);
        }

        // In other case check is it location TODO
        else if (message.location && modules.screenshot) {
            activeModule[chat] = new modules.screenshot(message);
        }

        // Or maybe user made a mistake (do not reply in groups)
        else if (chat > -1) {
            lang = settings.lang(chat);
            telegram.sendMessage(chat, i18n(lang, 'main', 'unknown_command'), 'home');
        }

        // Cleanup complete modules
        if (activeModule[chat] && activeModule[chat].complete) {
            delete activeModule[chat];
        }
    }

}());
