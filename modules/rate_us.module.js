/**
 * @file Rate us controller
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.modules = app.modules || {};
    app.modules.rateUs = RateUs;

    /**
     * Generate default keyboard markup
     * @return {Object} Inline keyboard markup
     */
    function generateMarkup(chat) {
        let lang = app.settings.lang(chat),
            result = {
                inline_keyboard: []
            };

        result.inline_keyboard.push([{
            text: app.i18n(lang, 'main', 'rate_us_1'),
            url: app.i18n(lang, 'main', 'rate_us_3')
        }]);

        return result;
    }

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function RateUs(message) {
        let chat = message.chat.id;

        this.complete = true;
        RateUs.reminder(chat);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    RateUs.initMessage = function(message) {
        let text = message.text && message.text.toLowerCase();

        return (text === '/like@' + app.me.username.toLowerCase()) || (text === '/like');
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    RateUs.onCallback = function (cb) {
        let lang,
            chat = cb.message.chat.id,
            messageId = cb.message.message_id,
            data = cb.data && cb.data.split('::') || [];

        switch (data[1]) {
            case 'start':
                this.reminder(chat);
                break;

            default:
                lang = app.settings.lang(chat);
                app.telegram.updateMessage(chat, messageId, 'ERROR: Incorrect action', 'clear_inline');
                app.telegram.sendMessage(chat, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
        }
    };

    /**
     * Reminder message that can be shown for active users
     * @static
     * @param chat {Number}
     */
    RateUs.reminder = function(chat) {
        let lang = app.settings.lang(chat);

        app.analytics(chat, 'Rate us offered');
        app.telegram.sendMessage(chat, app.i18n(lang, 'main', 'rate_us_2'), generateMarkup(chat));
    }
}());