var i18n = require(__dirname + '/i18n_extend.js'),
    telegram = require(__dirname + '/telegram.js'),
    settings = require(__dirname + '/settings.js');


module.exports.homeMarkup = function(id) {
    var markup,
        lang = settings.language(id);

    markup = {
        one_time_keyboard: true,
        resize_keyboard: true,
        keyboard: []
    };

    markup.keyboard.push([i18n(lang, 'common', 'make_screenshot')]);

    if (settings.profile(id).screenshotsRequested < 3) {
        markup.keyboard.push([i18n(lang, 'common', 'what_is_ingress_option')]);
    } else {
        //markup.keyboard.push([i18n(lang, 'common', 'rate_us')]);
        //markup.keyboard.push([i18n(lang, 'common', 'device_poll')]);
    }

    markup.keyboard.push([i18n(lang, 'common', 'language')]);

    return markup;
};