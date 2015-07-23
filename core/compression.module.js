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
        zh-cmn-Hans: '你可以收到未经压缩的图片（会增加传输的数据）'
        zh-cmn-Hant: '你可以收到未經壓縮的圖片（會增加傳輸的數據）'
    };
        

    onText = {
        en: 'Enable compression',
        ru: 'Включить сжатие',
        ua: 'Увімкнути стиснення'
        zh-cmn-Hans: '启用压缩'
        zh-cmn-Hant: '啟用壓縮'
    };

    offText = {
        en:'Disable compression',
        ru: 'Отключить сжатие',
        ua: 'Вимкнути стиснення'
        zh-cmn-Hans: '停用压缩'
        zh-cmn-Hant: '停用壓縮'
    };

    savedText = {
        en: 'Changes saved',
        ru: 'Изменения сохранены',
        ua: 'Зміни збережено'
        zh-cmn-Hans: '修改已保存'
        zh-cmn-Hant: '修改已保存'
    };

    incorrectOptionText = {
        en: 'Incorrect input. Please try again',
        ru: 'Неправильный выбор. Выберите из предложенных вариантов',
        ua: 'Неправильний вибір. Виберіть із запропонованих варіантів'
        zh-cmn-Hans: '输入有误，请重试'
        zh-cmn-Hant: '輸入有誤，請重試'        
    };
}());
