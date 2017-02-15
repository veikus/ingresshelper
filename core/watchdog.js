/**
 * @file Watchdog (automatically restart bot when no reply from telegram for more than 1 minute)
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    var lastAction = new Date().getTime();

    setInterval(function() {
        var ts = new Date().getTime();

        if (ts - lastAction > 60 * 1000) {
            if (app.activeWindow) {
                chrome.windows.remove(app.activeWindow);
            }

            window.location.reload();
        }
    }, 1000);

    app.watchdog = function() {
        lastAction = new Date().getTime();
    }
}());