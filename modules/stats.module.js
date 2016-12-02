/**
 * @file Statistic calculation module
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    let screenshotsData;

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
        let text = message.text && message.text.toLowerCase();

        return (text === '/stats@' + app.me.username.toLowerCase()) || (text === '/stats');
    };

    /**
     * @param message {object} Telegram message object
     */
    Stats.prototype.onMessage = function (message) {
        let result = [],
            dau = 0,
            languages = {},
            languagesArr = [],
            countries = {},
            countriesArr = [];

            if (app.taskManager) {
            result.push('Tasks in queue: ' + app.taskManager.queueLength());
            result.push('');
        }


        Object.keys(localStorage).forEach(function(key) {
            if (key.indexOf('settings__chat') === 0) {
                let val = JSON.parse(localStorage.getItem(key)),
                    lastActivity = val.lastActivity,
                    lang = val.language || 'en',
                    location = val.history && val.history[0];

                if (lastActivity && lastActivity > new Date().getTime() - 24 * 60 * 60 * 1000) {
                    ++dau;

                    languages[lang] = languages[lang] || 0;
                    ++languages[lang];

                    if (location && location.countryCode) {
                        countries[location.countryCode] = countries[location.countryCode] || 0;
                        ++countries[location.countryCode];
                    }
                }
            }
        });

        // Common 24h
        result.push('Last 24 hours:');
        result.push('DAU: ' + dau);
        result.push('');

        // Languages
        result.push('Languages top:');
        Object.keys(languages).forEach(function(key) {
            let count = languages[key],
                name = app.i18nTexts.lang.title[key];

            languagesArr.push({ key: key, name: name, count: count });
        });

        languagesArr
            .sort(function (a, b) {
                return b.count - a.count;
            })
            .forEach(function(item) {
                result.push(item.name + ': ' + item.count);
            });

        result.push('');

        // Countries
        result.push('Countries top:');
        Object.keys(countries).forEach(function(key) {
            let count = countries[key];

            countriesArr.push({ key: key, count: count });
        });

        countriesArr
            .sort(function (a, b) {
                return b.count - a.count;
            })
            .forEach(function(item) {
                result.push(item.key + ': ' + item.count);
            });
        result.push('');


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
