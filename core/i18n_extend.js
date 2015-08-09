/**
 * @file i18n
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var texts = require(__dirname + '/../i18n/i18n.js');

    function i18n(lang, module, key) {
        var result;

        result = texts[module] && texts[module][key] && texts[module][key][lang];

        if (!result) {
            result = texts[module] && texts[module][key] && texts[module][key].en;
        }

        return result || '';
    }

    i18n.getLanguages = function() {
        var languages = {};

        var key, val,
            all = texts.lang.title;

        for (key in all) {
            if (all.hasOwnProperty(key)) {
                val = all[key];
                languages[val] = key;
            }
        }

        return languages;
    };

    module.exports = i18n;
}());