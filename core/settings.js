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
}());