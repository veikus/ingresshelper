(function() {
    var helpText, onText, offText, savedText, incorrectOptionText;

    app.modules = app.modules || {};
    app.modules.compression = Compression;

    Compression.initMessage = '/compression';

    function Compression(message) {
        var resp, markup;

        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);

        markup = {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: [
                [offText[this.lang] || offText.en],
                [onText[this.lang] || onText.en]
            ]
        };

        resp = helpText[this.lang] || helpText.en;
        app.telegram.sendMessage(this.chat, resp, markup);
    }

    Compression.prototype.onMessage = function (message) {
        var resp, offOption, onOption,
            text = message.text;

        offOption = offText[this.lang] || offText.en;
        onOption = onText[this.lang] || onText.en;

        if (text === offOption) {
            app.settings.compression(this.chat, false);
            this.complete = true;
        } else if (text === onOption) {
            app.settings.compression(this.chat, true);
            this.complete = true;
        }

        if (this.complete) {
            resp = savedText[this.lang] || savedText.en;
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = incorrectOptionText[this.lang] || incorrectOptionText.en;
            app.telegram.sendMessage(this.chat, resp);
        }
    };

    // Translations
    helpText = {
        en: 'You can get uncompressed images (increase data transfer)',
        ru: 'Вы можете отключить сжатие изображений (требуется больше трафика)',
        ua: 'Ви можете вимкнути стиснення зображень (потребує більше трафіку)'
    };

    onText = {
        en: 'Enable compression',
        ru: 'Включить сжатие',
        ua: 'Увімкнути стиснення'
    };

    offText = {
        en:'Disable compression',
        ru: 'Отключить сжатие',
        ua: 'Вимкнути стиснення'
    };

    savedText = {
        en: 'Changes saved',
        ru: 'Изменения сохранены',
        ua: 'Зміни збережено'
    };

    incorrectOptionText = {
        en: 'Incorrect input. Please try again',
        ru: 'Неправильный выбор. Выберите из предложенных вариантов',
        ua: 'Неправильний вибір. Виберіть із запропонованих варіантів'
    };
}());