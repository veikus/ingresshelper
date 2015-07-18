(function() {
    var levelsMarkupText, selectZoomLevelText, incorrectInputText, taskSavedText;

    app.modules = app.modules || {};
    app.modules.screenshot = Screenshot;

    Screenshot.initMessage = '/screenshot';

    function Screenshot(message) {
        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);
        this.location = null;
        this.onMessage(message);
    }

    Screenshot.prototype.onMessage = function (message) {
        var resp, markup, zoom,
            text = message.text,
            location = message.location;

        markup = {
            keyboard: levelsMarkupText[this.lang] || levelsMarkupText.en,
            one_time_keyboard: true
        };

        // Step 1
        if (location && location.latitude && location.longitude ) {
            this.location = location;
            resp = selectZoomLevelText[this.lang] || selectZoomLevelText.en;

            app.telegram.sendMessage(this.chat, resp, markup);
            return;
        }

        // Step 2
        zoom = parseInt(text);
        if (zoom && zoom >= 3 && zoom <= 17) {
            this.complete = true;

            app.taskManager.add({
                chat: this.chat,
                location: this.location,
                zoom: zoom
            });

            resp = taskSavedText[this.lang] || taskSavedText.en ;
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = incorrectInputText[this.lang] || incorrectInputText.en;
            app.telegram.sendMessage(this.chat, resp, markup);
        }
    };

    // Translations
    selectZoomLevelText = {
        en: 'Select zoom level',
        ru: 'Выберите масштаб карты',
        ua: 'Оберіть масштаб мапи'
    };

    incorrectInputText = {
        en: 'Incorrect input',
        ru: 'Неверный ввод. Выберите из предложенных вариантов',
        ua: 'Неправильне значення. Оберіть із запропонованих варіантів'
    };

    taskSavedText = {
        en: 'Task saved. Please wait for a few minutes',
        ru: 'Задача сохранена. Через несколько минут вы получите скриншот',
        ua: 'Завдання збережено. За декілька хвилин Ви отримаєте знімок'
    };

    levelsMarkupText = {};
    levelsMarkupText.en = [
        ['17 - All portals'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - World']
    ];
    levelsMarkupText.ru = [
        ['17 - Все порталы'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - Весь мир']
    ];
    levelsMarkupText.ua = [
        ['17 - Усі портали'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - Весь світ']
    ];
}());