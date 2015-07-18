(function() {
    app.modules = app.modules || {};
    app.modules.banderavec = Banderavec;

    Banderavec.initMessage = 'Слава Україні!';

    function Banderavec(message) {
        this.chat = message.chat.id;
        this.lang = app.settings.lang(this.chat);
        this.complete = true;

        app.telegram.sendMessage(this.chat, 'Героям слава!', null);
    }

    Banderavec.prototype.onMessage = function (message) {};
}());