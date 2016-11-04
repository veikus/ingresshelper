/**
 * @file Geocoder
 * @author Artem Veikus artem@veikus.com
 * @version 2.5.0
 * @description https://tech.yandex.ru/maps/doc/geocoder/desc/concepts/input_params-docpage/
 */
(function() {
    app.geocoder = function(lang, location, cb) {
        var params = {
            format: 'json',
            geocode: [location.longitude, location.latitude].join(','),
            kind: 'street',
            results: 1
        };

        switch (lang) {
            case 'ru':
                params.lang = 'ru_RU';
                break;

            case 'ua':
                params.lang = 'uk_UA';
                break;

            default:
                params.lang = 'en_US';
        }

        request('https://geocode-maps.yandex.ru/1.x/', params, function(data) {
            var name, city, country, result,
                object = data
                    && data.response
                    && data.response.GeoObjectCollection
                    && data.response.GeoObjectCollection.featureMember
                    && data.response.GeoObjectCollection.featureMember[0]
                    && data.response.GeoObjectCollection.featureMember[0].GeoObject
                    && data.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty
                    && data.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData;

            if (!object) {
                return cb && cb(null);
            }

            name = object.text;

            city = object.AddressDetails
                && object.AddressDetails.Country
                && object.AddressDetails.Country.AdministrativeArea
                && object.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName;

            country = object.AddressDetails
                && object.AddressDetails.Country
                && object.AddressDetails.Country.CountryNameCode;

            if (name && city && country) {
                result = {
                    name: name,
                    city: city,
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