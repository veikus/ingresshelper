(function() {
    app.settings = {};

    app.settings.lang = function(id, lang) {
        var settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        if (lang) {
            settings.language = lang;
            localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
        }

        return settings && settings.language || null;
    };

    app.settings.compression = function(id, value) {
        var settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        if (typeof (value) === 'boolean') {
            settings.compression = value;
            localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
        }

        return settings && settings.hasOwnProperty('compression') ? settings.compression : true;
    };

    app.settings.plugins = function(id, value) {
        var settings = localStorage.getItem('settings__chat_' + id);

        if (settings) {
            settings = JSON.parse(settings);
        } else {
            settings = {};
        }

        if (value) {
            settings.plugins = value;
            localStorage.setItem('settings__chat_' + id, JSON.stringify(settings));
        }

        return settings && settings.plugins || [];
    };
}());