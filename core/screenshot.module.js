(function() {
    var levelsMarkup, selectZoomLevel, incorrectInput, taskSaved;

    app.modules = app.modules || {};
    app.modules.screenshot = Screenshot;

    Screenshot.initMessage = '/screenshot';

    function Screenshot(message) {
        this.chat = message.chat.id;
        this.location = null;
        this.onMessage(message);
    }

    Screenshot.prototype.onMessage = function (message) {
        var resp, markup, zoom,
            lang = app.settings.lang(this.chat),
            text = message.text,
            location = message.location;


        markup = {
            keyboard: levelsMarkup[lang] || levelsMarkup.en,
            one_time_keyboard: true
        };

        // Step 1
        if (location && location.latitude && location.longitude ) {
            this.location = location;
            resp = selectZoomLevel[lang] || selectZoomLevel.en;

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

            resp = taskSaved[lang] || taskSaved.en ;
            app.telegram.sendMessage(this.chat, resp, null);
        } else {
            resp = incorrectInput[lang] || incorrectInput.en;
            app.telegram.sendMessage(this.chat, resp, markup);
        }
    };

    // Translations
    selectZoomLevel = {};
    selectZoomLevel.en = 'Select zoom level';
    selectZoomLevel.ru = 'Выберите масштаб карты';

    incorrectInput = {};
    incorrectInput.en = 'Incorrect input';
    incorrectInput.ru = 'Неверный ввод. Выберите из предложенных вариантов';

    taskSaved = {};
    taskSaved.en = 'Task saved. Please wait for a few minutes';
    taskSaved.ru = 'Задача сохранена. Через несколько минут вы получите скриншот';

    levelsMarkup = {};
    levelsMarkup.en = [
        ['17 - All portals'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - World']
    ];
    levelsMarkup.ru = [
        ['17 - Все порталы'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - Весь мир']
    ];
}());