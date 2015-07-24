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
        '🇷🇺Русский': 'ru',
        '简体中文': 'zh-cmn-Hans',
        '繁體中文': 'zh-cmn-Hant'
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
        ua: 'Будь ласка, оберіть мову, якою Вам зручніше користуватися',
        zh-cmn-Hans: '请选择语言',
        zh-cmn-Hant: '請選擇語言'
    };

    incorrectLanguageText = {
        en: 'Incorrect input. Please try again',
        ru: 'Неправильный выбор. Выберите из предложенных вариантов',
        ua: 'Неправильне значення. Виберіть із запропонованих варіантів',
        zh-cmn-Hans: '输入有误，请重试',
        zh-cmn-Hant: '輸入有誤，請重試'
    };

    savedText = {
        en: 'Changes saved',
        ru: 'Изменения сохранены',
        ua: 'Зміни збережено'
        zh-cmn-Hans: '修改完成',
        zh-cmn-Hant: '修改完成'
    };

    helpUsText = {
        en: 'You can translate this bot to your language. Send message to @veikus if you want to participate',
        ru: 'Хотите помочь с переводом на другой язык? Напишите об этом @veikus',
        ua: 'Бажаете допомогти з перекладом на інші мови? Звертайтеся до @veikus'
        zh-cmn-Hans: '您可以参与此机器人的本地化工作，详情请联系@veikus',
        zh-cmn-Hant: '您可以參與此機器人的語言翻譯，詳情請聯繫@veikus'
    };
}());
