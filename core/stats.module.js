/**
 * @file Statistic calculation module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        taskManager = require(__dirname + '/task_manager.js'),
        botan = require('botanio')(61578);

    Stats.initMessage = '/stats';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Stats(message) {
        this.chat = message.chat.id;
        this.lang = settings.lang(this.chat);
        this.complete = true;

        this.onMessage(message);
        botan.track(message, 'Stats');
    }

    /**
     * @param message {object} Telegram message object
     */
    Stats.prototype.onMessage = function (message) {
        var result = [];

        result.push(i18n(this.lang, 'stats', 'tasks_in_queue') + taskManager.queueLength());

        telegram.sendMessage(this.chat, result.join('\n\r'), null);
    };

    module.exports = Stats;
}());
