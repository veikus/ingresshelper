/**
 * @file i18n
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var texts = require(__dirname + '/../i18n/i18n.js');

    module.exports = function(lang, module, key) {
        var result;

        result = texts[module] && texts[module][key] && texts[module][key][lang];

        if (!result) {
            result = texts[module] && texts[module][key] && texts[module][key].en;
        }

        return result || '';
    };

}());