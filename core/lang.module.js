/**
 * @file Language setup module
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    var welcomeText, incorrectLanguageText, helpUsText, savedText, languages,
        markup = {};

    app.modules = app.modules || {};
    app.modules.lang = Lang;

    Lang.initMessage = '/language';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Lang(message) {
        var resp;

        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);

        resp = welcomeText[this.lang] || welcomeText.en;
        app.telegram.sendMessage(this.chat, resp, markup);
    }

    /**
     * @param message {object} Telegram message object
     */
    Lang.prototype.onMessage = function (message) {
        var resp,
            lang = this.lang,
            text = message.text;

        if (languages[text]) {
            lang = languages[text];
            resp = savedText[lang] || savedText.en;
            resp += '\n\n';
            resp += helpUsText[lang] || helpUsText.en;

            app.settings.lang(this.chat, lang);

            this.complete = true;
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = incorrectLanguageText[lang] || incorrectLanguageText.en;
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
    welcomeText = {
        en: 'Please choose your language',
        ru: 'Пожалуйста выберите язык, который вам удобней использовать',
        ua: 'Будь ласка, оберіть мову, якою Вам зручніше користуватися'
    };

    incorrectLanguageText = {
        en: 'Incorrect input. Please try again',
        ru: 'Неправильный выбор. Выберите из предложенных вариантов',
        ua: 'Неправильне значення. Виберіть із запропонованих варіантів'
    };

    savedText = {
        en: 'Changes saved',
        ru: 'Изменения сохранены',
        ua: 'Зміни збережено'
    };

    helpUsText = {
        en: 'You can translate this bot to your language. Send message to @veikus if you want to participate',
        ru: 'Хотите помочь с переводом на другой язык? Напишите об этом @veikus',
        ua: 'Бажаете допомогти з перекладом на інші мови? Звертайтеся до @veikus'
    };
}());