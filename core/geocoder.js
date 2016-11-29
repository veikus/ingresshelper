/**
 * @file Geocoder
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 * @description https://developers.google.com/maps/documentation/geocoding/intro#ComponentFiltering
 */
(function() {
    app.geocoder = function(lang, location, cb) {
        var params = {
            latlng: [location.latitude, location.longitude,].join(',')
        };

        switch (lang) {
            case 'ru':
                params.language = 'ru';
                break;

            case 'ua':
                params.language = 'uk';
                break;

            case 'fi':
                params.language = 'fi';
                break;

            case 'de':
            case 'chde':
                params.language = 'de';
                break;

            case 'br':
                params.language = 'pt';
                break;

            case 'it':
                params.language = 'it';
                break;

            case 'ro-md':
                params.language = 'ro';
                break;

            case 'fr':
                params.language = 'fr';
                break;

            case 'bg':
                params.language = 'bg';
                break;

            case 'se':
                params.language = 'sv';
                break;

            default:
                params.language = 'en';
        }

        request('https://maps.googleapis.com/maps/api/geocode/json', params, function(data) {
            var name, city, country, result, route,
                object = data
                    && data.results
                    && data.results[0];

            if (!object) {
                return cb && cb(null);
            }

            name = object.formatted_address;

            object.address_components.forEach(function(item) {
                if (item.types.indexOf('locality') !== -1) {
                    city = item.long_name;
                }

                if (item.types.indexOf('route') !== -1) {
                    route = item.long_name;
                }

                if (item.types.indexOf('country') !== -1) {
                    country = item.short_name;
                }
            });

            if (name && (city || route) && country) {
                result = {
                    name: name,
                    city: city || route,
                    country: country
                }
            } else {
                result = null;
            }

            cb && cb(result);
        });
    };

    function request(url, data, callback) {
        var xmlhttp = new XMLHttpRequest();

        if (typeof callback !== 'function') {
            callback = undefined;
        }

        url += '?' + serialize(data);

        xmlhttp.onreadystatechange = function() {
            var result = null;

            if (xmlhttp.readyState !== 4) {
                return;
            }

            try {
                result = JSON.parse(xmlhttp.responseText);
            } catch (e) {
                console.error('JSON parse error: ' + e);
            }

            if (callback) {
                callback(result);
            }
        };

        xmlhttp.open('GET', url, true);
        xmlhttp.send();
    }

    function serialize(obj) {
        var p,
            str = [];

        for (p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }

        return str.join('&');
    }
}());