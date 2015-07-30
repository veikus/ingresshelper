/**
 * @file Rate us controller
 * @author Artem Veikus artem@veikus.com
 * @version 2.3
 */
(function() {
    var users = localStorage.getItem('rate_us__users');

    if (users) {
        users = JSON.parse(users);
    } else {
        users = {};
    }

    app.rateUs = function(chat) {
        // Send vote us messages after 3 photos sent
        var resp,
            sent = users[chat] || 0,
            lang = app.settings.lang(chat);

        ++sent;

        console.log('xxx', sent);

        if (sent === 3) {
            resp = [
                app.i18n(lang, 'main', 'rate_us_1'),
                app.i18n(lang, 'main', 'rate_us_2'),
                app.i18n(lang, 'main', 'rate_us_3')
            ].join('\n');

            app.telegram.sendMessage(chat, resp);
        }

        users[chat] = sent;

        localStorage.setItem('rate_us__users', JSON.stringify(users))
    }

}());