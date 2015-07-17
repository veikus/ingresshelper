(function() {
    var helpResponse = {},
        help = {};

    app.modules = app.modules || {};
    app.modules.help = Help;

    Help.initMessage = '/help';

    function Help(message) {
        this.onMessage(message);
    }

    Help.prototype.onMessage = function (message) {
        var chat = message.chat.id,
            lang = app.settings.lang(chat),
            resp = helpResponse[lang] || helpResponse.en;

        this.complete = true;
        app.telegram.sendMessage(chat, resp);
    };

    // Translations
    helpResponse.en = [
        'Send your location to the bot, then select map zoom (3 - 17). Happy Ingressing!',
        'Original idea: @veikus',
        'Source code: http://github.com/veikus/ingresshelper'
    ].join('\n\r');

    helpResponse.ru = [
        'Вышлите боту свои координаты, затем укажите уровень зума и через несколько минут вы получите скриншот интела',
        'Идея: @veikus',
        'Исходный код: http://github.com/veikus/ingresshelper'
    ].join('\n\r');
}());