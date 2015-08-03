(function() {
    var message,
        chats = [],
        stats = JSON.parse(localStorage.stats__screenshots);

    message = [
        'Good news everyone!',
        'We have translated our bot to 11 languages.',
        'Select yours with /language command.',
        '🇬🇧🇷🇺🇺🇦🇨🇳🇫🇮🇩🇪🇨🇭🇪🇸🇵🇹🇮🇹',
        'Happy ingressing!'
    ].join('\n\n');

    stats.forEach(function(item) {
        var chat = item.chat;

        if (chats.indexOf(chat) === -1) {
            chats.push(chat);
            app.telegram.sendMessage(chat, message);
        }
    });

}());