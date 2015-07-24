/**
 * @file Help module
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    var helpResponseText;

    app.modules = app.modules || {};
    app.modules.help = Help;

    Help.initMessage = '/help';

    /**
     * @param message {object} Telegram message object
     * @constructor
     */
    function Help(message) {
        this.onMessage(message);
    }

    /**
     * @param message {object} Telegram message object
     */
    Help.prototype.onMessage = function (message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            resp = helpResponseText[lang] || helpResponseText.en;

        this.complete = true;
        app.telegram.sendMessage(chat, resp, null);
    };

    // Translations
    helpResponseText = {};

    helpResponseText.en = [
        'Send your location to the bot, then select map zoom (3 - 17). Happy Ingressing!',
        'Original idea: @veikus',
        'Source code: http://github.com/veikus/ingresshelper'
    ].join('\n\r');

    helpResponseText.ru = [
        'Вышлите боту свои координаты, затем укажите уровень зума и через несколько минут вы получите скриншот интела',
        'Идея: @veikus',
        'Исходный код: http://github.com/veikus/ingresshelper'
    ].join('\n\r');

    helpResponseText.ua = [
        'Надішліть боту свої координати, далі вкажіть рівень наближення, і за декілька хвилин Ви отримаєте знімок інтелу',
        'Ідея: @veikus',
        'Автор українскього перекладу: @Ukrrooter',
        'Оригінал коду: http://github.com/veikus/ingresshelper'
    ].join('\n\r');

    helpResponseText['zh-cmn-Hans'] = [
        '把你的位置发送给机器人，然后选择放大等级（3 - 17）. 玩得开心哦!',
        '作者: @veikus',
        '翻译：@aerocaterpillar',
        '源代码: http://github.com/veikus/ingresshelper'
    ].join('\n\r');
    
    helpResponseText['zh-cmn-Hant'] = [
        '把你的位置發送給機器人，然後選擇放大等級（3 - 17）. 玩得開心哦!',
        '作者: @veikus',
        '翻譯：@aerocaterpillar',
        '源代碼: http://github.com/veikus/ingresshelper'
    ].join('\n\r');
    
}());
