/**
 * @file Rate us controller
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    app.modules = app.modules || {};
    app.modules.rateUs = RateUs;

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function RateUs(message) {
        this.complete = true;
        RateUs.reminder(message.chat.id);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    RateUs.initMessage = function(message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            text = message.text && message.text.toLowerCase();

        return text === '/like' || text === app.i18n(lang, 'common', 'rate_us').toLowerCase();
    };

    /**
     * Reminder message that can be shown for active users
     * @static
     * @param chat {Number}
     */
    RateUs.reminder = function(chat) {
        var resp,
            lang = app.settings.lang(chat);

        resp = [
            app.i18n(lang, 'main', 'rate_us_1'),
            app.i18n(lang, 'main', 'rate_us_2'),
            app.i18n(lang, 'main', 'rate_us_3')
        ].join('\n');

        app.telegram.sendMessage(chat, resp, app.getHomeMarkup());
    }
}());