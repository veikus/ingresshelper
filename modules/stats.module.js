/**
 * @file Statistic calculation module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 */
(function() {
    var screenshotsData;

    app.modules = app.modules || {};
    app.modules.stats = Stats;

    // Initialization
    screenshotsData = localStorage.getItem('stats__screenshots');
    screenshotsData = screenshotsData ? JSON.parse(screenshotsData) : [];

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Stats(message) {
        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);
        this.complete = true;

        this.onMessage(message);
    }

    /**
     * @static
     * @param message {object} Telegram message object
     * @returns {boolean}
     */
    Stats.initMessage = function(message) {
        var text = message.text && message.text.toLowerCase();

        return (text === '/stats@' + app.me.username.toLowerCase()) || (text === '/stats');
    };

    /**
     * @param message {object} Telegram message object
     */
    Stats.prototype.onMessage = function (message) {
        var result = [];

        if (app.taskManager) {
            // todo translation
            result.push('Tasks in queue: ' + app.taskManager.queueLength());
        }

        app.telegram.sendMessage(this.chat, result.join('\r\n'), app.getHomeMarkup(this.chat));
        app.analytics(this.chat, 'Stats open');
    };

    /**
     * Saves screenshot requests statistics
     * @param task {object}
     * @param task.chat {Number} Chat id
     * @param task.location {Object} Longitude and latitude
     * @param task.zoom {Number} Zoom value
     */
    Stats.trackScreenshot = function(task) {
        screenshotsData.push({
            ts: new Date(),
            chat: task.chat,
            zoom: task.zoom,
            location: {
                latitude: task.location.latitude,
                longitude: task.location.longitude
            }
        });

        localStorage.setItem('stats__screenshots', JSON.stringify(screenshotsData));
    }
}());
