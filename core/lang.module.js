(function() {
    var languages, welcomeText, incorrectLanguage, saved,
        markup = {};

    app.modules = app.modules || {};
    app.modules.lang = Lang;

    Lang.initMessage = '/language';

    function Lang(message) {
        var resp;

        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);

        resp = welcomeText[this.lang] || welcomeText.en;
        app.telegram.sendMessage(this.chat, resp, markup);
    }

    Lang.prototype.onMessage = function (message) {
        var resp,
            lang = this.lang,
            text = message.text;

        if (languages[text]) {
            lang = languages[text];
            resp = saved[lang] || saved.en;

            app.settings.lang(this.chat, lang);

            this.complete = true;
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = incorrectLanguage[lang] || incorrectLanguage.en;
            app.telegram.sendMessage(this.chat, resp);
        }
    };

    // Markup generator
    languages = {
        '🇬🇧English': 'en',
        '🇺🇦Українська': 'ua',
        '🇷🇺Русский': 'ru'
    };

    markup.one_time_keyboard = true;
    markup.resize_keyboard = true;
    markup.keyboard = [];

    Object.keys(languages).forEach(function(lang) {
        markup.keyboard.push([lang]);
    });

    // Translations
    welcomeText = {};
    welcomeText.en = 'Please choose your language';
    welcomeText.ru = 'Пожалуйста выберите язык, который вам удобней использовать';
    welcomeText.ua = 'Будь ласка, оберіть мову, якою Вам зручніше користуватися';

    incorrectLanguage = {};
    incorrectLanguage.en = 'Incorrect input. Please try again';
    incorrectLanguage.ru = 'Неправильный выбор. Выберите из предложенных вариантов';
    incorrectLanguage.ua = 'Неправильне значення. Виберіть із запропонованих варіантів';

    saved = {};
    saved.en = 'Changes saved';
    saved.ru = 'Изменения сохранены';
    saved.ua = 'Зміни збережено';
}());