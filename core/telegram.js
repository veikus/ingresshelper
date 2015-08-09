var TOKEN = 'INSET_TOKEN_HERE',
    API_URL = 'https://api.telegram.org/bot' + TOKEN,
    TIMEOUT = 10,
    FormData = require('form-data'),
    https = require('https'),
    querystring = require('querystring'),
    request = require('request'),
    q = require('q'),
    fs = require('fs'),
    offset = 0;

/**
 * Send message to specified chat
 * @param chatId {Number} Chat id
 * @param message {String} Message
 * @param markup {Object|undefined|null} Keyboard markup (null hides previous keyboard, undefined leaves it)
 * @return promise
 */
module.exports.sendMessage = function (chatId, message, markup) {
    var url,
        dfd = q.defer();

    if (markup === null) {
        markup = { hide_keyboard: true };
    }

    markup = JSON.stringify(markup);
    url = API_URL + '/sendMessage';

    apiRequest('post', url, {
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
        reply_markup: markup
    })
        .then(function(res) {
            if (res.ok) {
                dfd.resolve();
            } else {
                dfd.reject({ error: res.description })
            }
        })
        .fail(dfd.reject);

    return dfd.promise;
};

/**
 * Send photo to specified chat
 * @param chatId {Number} Chat id
 * @param photo {String} Path to image file
 * @param compression {Boolean} If true image will be compressed by telegram
 * @return promise
 */
module.exports.sendPhoto = function (chatId, photo, compression) {
    var url = API_URL + (compression ? '/sendPhoto' : '/sendDocument'),
        form = new FormData(),
        dfd = q.defer();

    form.append('chat_id', chatId);
    form.append(compression ? 'photo' : 'document', fs.createReadStream(photo));

    try {
        // form.submit crashed several times
        form.submit(url, submitCb);
    } catch(e) {
        dfd.reject({ error: 'form.submit crashed' });
    }

    function submitCb(err, res) {
        var responseText = '';

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            responseText += chunk;
        });

        res.on('end', function() {
            var photo;

            try {
                responseText = JSON.parse(responseText);
                photo = responseText.ok && responseText.result.photo && responseText.result.photo.pop();

                if (photo && photo.file_id) {
                    dfd.resolve({ fileId: photo.file_id });
                } else {
                    dfd.reject({ error: 'No file id' });
                }
            } catch (e) {
                dfd.reject({ error: 'JSON parse error: ' + e });
            }
        });

        res.on('error', function() {
            dfd.reject({ error: 'Request error' });
        });
    }

    return dfd.promise;
};

/**
 * Get new messages from server
 * @return promise
 */
module.exports.getUpdates = function () {
    var url = API_URL + '/getUpdates',
        dfd = q.defer();

    apiRequest('get', url, { timeout: TIMEOUT, offset: offset })
        .then(function(data) {
            var result = [];

            if (data && data.ok) {
                data.result.forEach(function (val) {
                    result.push(val.message);
                    offset = val.update_id + 1;
                });
            }

            dfd.resolve(result);
        })
        .fail(function() {
            dfd.reject(null);
        });

    return dfd.promise;
};

/**
 * Request wrapper
 * @param method {String} GET or POST
 * @param url {String} Request url
 * @param data {Object} Request parameters
 * @return promise
 */
function apiRequest(method, url, data) {
    var req, options,
        dfd = q.defer();

    options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: url,
        method: method
    };

    data = querystring.stringify(data);

    if (method.toLowerCase() === 'post') {
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        };
    } else {
        options.path += '?' + data;
    }

    req = https.request(options, function(res) {
        var responseText = '';

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            responseText += chunk;
        });

        res.on('end', function() {
            try {
                dfd.resolve(JSON.parse(responseText));
            } catch (e) {
                dfd.reject({ error: 'JSON parse error: ' + e, text: responseText });
                console.error('JSON parse error: ' + e);
            }
        })
    });

    req.on('error', function(e) {
        dfd.reject({ error: 'Request error: ' + e.message });
    });

    if (method.toLowerCase() === 'post') {
        req.write(data);
    }

    req.end();

    return dfd.promise;
}