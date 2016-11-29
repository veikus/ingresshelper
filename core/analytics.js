/**
 * @file Analytics
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.1
 */
(function() {
    let usersDetailsSent = [],
        mixpanelEnabled =  window.mixpanel && app.config.mixPanelToken;

    if (mixpanelEnabled) {
        mixpanel.init(app.config.mixPanelToken, { api_host: "https://api.mixpanel.com" });
    }

    app.analytics = function(chat, event, params) {
        params = params || {};

        if (mixpanelEnabled) {
            mixpanel.identify(chat);
            mixpanel.track(event, params);
        }
    };

    app.analytics.setBaseDetails = function(chat, data) {
        if (usersDetailsSent.indexOf(chat) === -1) {
            usersDetailsSent.push(chat);
            app.analytics.updateUser(chat, data);
        }
    };

    app.analytics.updateUser = function(chat, data) {
        if (mixpanelEnabled) {
            mixpanel.identify(chat);
            mixpanel.people.set(data);
        }
    };

    app.analytics.increment = function(chat, prop, by) {
        if (mixpanelEnabled) {
            mixpanel.identify(chat);
            mixpanel.people.increment(prop, by || 1);
        }
    };
}());