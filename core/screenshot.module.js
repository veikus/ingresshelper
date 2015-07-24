/**
 * @file Screenshot task creation module
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    var levelsMarkupText, selectZoomLevelText, incorrectInputText, taskSavedText, locationRequiredText;

    app.modules = app.modules || {};
    app.modules.screenshot = Screenshot;

    Screenshot.initMessage = '/screenshot';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Screenshot(message) {
        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);
        this.location = null;
        this.onMessage(message);
    }

    /**
     * @param message {object} Telegram message object
     */
    Screenshot.prototype.onMessage = function (message) {
        var resp, markup, zoom,
            text = message.text,
            location = message.location;

        markup = {
            keyboard: levelsMarkupText[this.lang] || levelsMarkupText.en,
            one_time_keyboard: true
        };

        // Step 1
        if (location && location.latitude && location.longitude) {
            this.location = location;
            resp = selectZoomLevelText[this.lang] || selectZoomLevelText.en;
            app.telegram.sendMessage(this.chat, resp, markup);
            return;
        } else if (!this.location) {
            resp = locationRequiredText[this.lang] || this.lang;
            app.telegram.sendMessage(this.chat, resp, null);
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
        ua: 'Оберіть масштаб мапи',
        'zh-cmn-Hans': '选择放大级别',
        'zh-cmn-Hant': '選擇放大級別'
    };

    incorrectInputText = {
        en: 'Incorrect input',
        ru: 'Неверный ввод. Выберите из предложенных вариантов',
        ua: 'Неправильне значення. Оберіть із запропонованих варіантів',
        'zh-cmn-Hans': '输入有误',
        'zh-cmn-Hant': '輸入有誤'
    };

    taskSavedText = {
        en: 'Task saved. Please wait for a few minutes',
        ru: 'Задача сохранена. Через несколько минут вы получите скриншот',
        ua: 'Завдання збережено. За декілька хвилин Ви отримаєте знімок',
        'zh-cmn-Hans': '任务保存完成，请稍候',
        'zh-cmn-Hant': '任務保存完成，請稍候'
    };

    locationRequiredText = {
        en: 'Send geolocation now',
        ru: 'Пришлите геолокацию нужной области',
        ua: 'Надішліть геолокацію необхідної області',
        'zh-cmn-Hans': '选择放大级别',
        'zh-cmn-Hant': '選擇放大級別'
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
    levelsMarkupText['zh-cmn-Hans'] = [
        ['17 - 显示所有po'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - 世界地图']
    ];
    levelsMarkupText['zh-cmn-Hant'] = [
        ['17 - 顯示所有po'],
        ['16', '15', '14', '13'],
        ['12', '10', '8', '6'],
        ['3 - 世界地圖']
    ];
}());
