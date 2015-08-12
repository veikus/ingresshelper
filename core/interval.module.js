/**
 * @file Interval setup and processing module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var allowedTimeouts, allowedPauses, timeoutMarkup, pauseMarkup, intervals,
    i18n = require(__dirname + '/i18n_extend.js'),
    telegram = require(__dirname + '/telegram.js'),
    settings = require(__dirname + '/settings.js'),
    taskManager = require(__dirname + '/task_manager.js'),
    db = require(__dirname + '/db.js'),
    config = require(__dirname + '/../config.js'),
    botan = require('botanio')(61578);

Interval.name = 'interval';

Interval.initMessage = function(message) {
    var chat = message.chat.id,
        lang = settings.lang(chat),
        text = message.text;

    return text === '/interval';
};

// Asynchronously load data from db
intervals = [];

db
    .getActiveIntervals()
    .then(function(data) {
        data.forEach(function(interval) {
            intervals.push(interval);
        })
    });

// Save data in DB
setInterval(function() {
    if (config.dbReadOnly) {
        return;
    }

    intervals.forEach(function(interval, i) {
        var method;

        if (!interval.id) {
            method = db.createInterval(interval);
        } else if (interval._updated) {
            method = db.updateInterval(interval);
        } else {
            return;
        }

        method.then(function(id) {
            interval._updated = false;

            if (id) {
                interval.id = id;
            }

            if (interval.id && interval.complete) {
                interval[i] = null;
            }
        })
    });
}, 60 * 1000);

setInterval(function () {
    var lang,
        ts = new Date().getTime();

    intervals.forEach(function (task, k) {
        if (!task || task.complete) {
            return;
        }

        if (task.nextPhotoAt <= ts) {
            task.nextPhotoAt = ts + task.pause;
            task.interval = true;
            task._updated = true;

            taskManager.add(task);
        }

        if (task.shutdownTime <= ts) {
            lang = settings.lang(task.chat);
            telegram.sendMessage(task.chat, i18n(lang, 'interval', 'interval_finished'));

            task.complete = true;
            task._updated = true;
        }
    });
}, 30000);

/**
 * @param message {object} Telegram message object
 * @constructor
 */
function Interval(message) {
    this.chat = message.chat.id;
    this.lang = settings.lang(this.chat);
    this.hasTask = this.findActiveTask() > -1;
    this.timeout = null;
    this.pause = null;
    this.location = null;

    this.onMessage(message);
    botan.track(message, 'Interval begin');
}

/**
 * @param message {object} Telegram message object
 */
Interval.prototype.onMessage = function (message) {
    var zoom, temp, i,
        text = message.text,
        location = message.location;

    // Cancel action
    temp = i18n(this.lang, 'interval', 'cancel');
    if (text === temp) {
        this.complete = true;
        telegram.sendMessage(this.chat, '👍', null); // thumbs up
        return;
    }

    // Active task warning
    temp = i18n(this.lang, 'interval', 'cancel_previous_option');
    if (this.hasTask && text === temp) {
        i = this.findActiveTask();

        if (i !== -1) {
            intervals[i].complete = true;
            intervals[i]._updated = true;
        }

        this.hasTask = false;
        this.sendMessage('timeout');
        return;
    } else if (this.hasTask) {
        this.sendMessage('activeTask');
        return;
    }

    // Timeout setup
    if (!this.timeout && allowedTimeouts[text]) {
        this.timeout = allowedTimeouts[text];
        this.sendMessage('pause');
        return;
    } else if (!this.timeout) {
        this.sendMessage('timeout');
        return;
    }

    // Pause setup
    if (!this.pause && allowedPauses[text]) {
        this.pause = allowedPauses[text];
        this.sendMessage('location');
        return;
    } else if (!this.pause) {
        this.sendMessage('pause');
        return;
    }

    // Location setup
    if (!this.location && location && location.latitude && location.longitude) {
        this.location = location;
        this.sendMessage('zoom');
        return;
    } else if (!this.location) {
        this.sendMessage('location');
        return;
    }

    // Zoom setup
    zoom = parseInt(text);
    if (!this.zoom && zoom && zoom >= 3 && zoom <= 17) {
        this.zoom = zoom;
        this.complete = true;

        intervals.push({
            chat: this.chat,
            timeout: this.timeout,
            pause: this.pause,
            latitude: this.location.latitude,
            longitude: this.location.longitude,
            zoom: this.zoom,
            created: new Date().getTime(),
            shutdownTime: new Date().getTime() + this.timeout,
            nextPhotoAt: new Date().getTime()
        });

        this.sendMessage('complete');
        botan.track(message, 'Interval complete');
    } else if (!this.zoom) {
        this.sendMessage('zoom');
    }
};

/**
 * Prepare and send response for each step
 * @param step {String}
 */
Interval.prototype.sendMessage = function (step) {
    var resp, markup, keyboard;

    switch (step) {
        case 'activeTask':
            resp = i18n(this.lang, 'interval', 'cancel_previous');
            markup = {
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: [
                    [i18n(this.lang, 'interval', 'cancel_previous_option')]
                ]
            };
            break;

        case 'timeout':
            resp = i18n(this.lang, 'interval', 'timeout_setup');
            markup = {
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: timeoutMarkup
            };
            break;

        case 'pause':
            resp = i18n(this.lang, 'interval', 'pause_setup');
            markup = {
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: pauseMarkup
            };
            break;

        case 'location':
            resp = i18n(this.lang, 'interval', 'location_setup');
            markup = null;
            break;

        case 'zoom':
            resp = i18n(this.lang, 'interval', 'zoom_setup');
            keyboard = [
                i18n(this.lang, 'interval', 'options_1').split(';'),
                i18n(this.lang, 'interval', 'options_2').split(';'),
                i18n(this.lang, 'interval', 'options_3').split(';'),
                i18n(this.lang, 'interval', 'options_4').split(';')
            ];
            markup = {
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: keyboard
            };
            break;

        case 'complete':
            resp = i18n(this.lang, 'interval', 'task_saved');
            markup = null;
    }

    if (markup) {
        markup.keyboard = markup.keyboard.slice();
        markup.keyboard.push([i18n(this.lang, 'interval', 'cancel')]);
    }
    telegram.sendMessage(this.chat, resp, markup);
};

/**
 * Find active task for current chat
 * @returns {number} Array index of found task (or -1)
 */
Interval.prototype.findActiveTask = function () {
    var result = -1,
        chat = this.chat;

    intervals.forEach(function (interval, i) {
        if (interval && !interval.complete && interval.chat === chat) {
            result = i;
        }
    });

    return result;
};

// Translations
allowedTimeouts = {
    '1 hour': 3600 * 1000,
    '2 hours': 2 * 3600 * 1000,
    '3 hours': 3 * 3600 * 1000,
    '6 hours': 6 * 3600 * 1000,
    '12 hours': 12 * 3600 * 1000,
    '24 hours': 86400 * 1000,
    //'2 days': 2 * 86400 * 1000,
    //'3 days': 3 * 86400 * 1000,
    //'4 days': 4 * 86400 * 1000,
    //'1 week': 7 * 86400 * 1000,
    //'2 weeks': 14 * 86400 * 1000,
    //'3 weeks': 21 * 86400 * 1000,
    //'1 year': 365 * 86400 * 1000
};

allowedPauses = {
    //'3 minutes': 3 * 60 * 1000,
    '5 minutes': 5 * 60 * 1000,
    '10 minutes': 10 * 60 * 1000,
    '15 minutes': 15 * 60 * 1000,
    '30 minutes': 30 * 60 * 1000,
    '45 minutes': 45 * 60 * 1000,
    '60 minutes': 3600 * 1000,
    '2 hours': 2 * 3600 * 1000,
    '4 hours': 4 * 3600 * 1000,
    '6 hours': 6 * 3600 * 1000,
    '12 hours': 12 * 3600 * 1000,
    '24 hours': 24 * 3600 * 1000
};

timeoutMarkup = [
    ['1 hour', '2 hours', '3 hours'],
    ['6 hours', '12 hours', '24 hours']
    //['2 days', '3 days', '4 days'],
    //['1 week', '2 weeks', '3 weeks'],
    //['1 year']
];

pauseMarkup = [
    ['5 minutes', '10 minutes', '15 minutes'],
    ['30 minutes', '45 minutes', '60 minutes'],
    ['2 hours', '4 hours', '6 hours'],
    ['12 hours', '24 hours']
];

module.exports = Interval;