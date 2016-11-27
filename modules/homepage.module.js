/**
 * @file Handler for "homepage" callback requests
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    app.modules = app.modules || {};
    app.modules.homepage = Homepage;

    /**
     * @constructor
     */
    function Homepage() {
        this.complete = true;
    }

    /**
     * @static
     * @returns {boolean}
     */
    Homepage.initMessage = function() {
        return false;
    };

    /**
     * @static
     * @param cb {object} Telegram callback object
     */
    Homepage.onCallback = function (cb) {
        let chat = cb.message.chat.id,
            lang = app.settings.lang(chat),
            messageId = cb.message.message_id;

        app.telegram.updateMessage(chat, messageId, app.i18n(lang, 'common', 'home_screen_title'), app.getHomeMarkup(chat));
    };
}());
