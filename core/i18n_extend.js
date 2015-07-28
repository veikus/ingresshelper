/**
 * @file i18n
 * @author Artem Veikus artem@veikus.com
 * @version 2.0
 */
(function() {
    var texts = app.i18nTexts;

    app.i18n = function(lang, module, key) {
        var result;

        result = texts[module] && texts[module][key] && texts[module][key][lang];

        if (!result) {
            result = texts[module] && texts[module][key] && texts[module][key].en;
        }

        return result || '';
    };

}());