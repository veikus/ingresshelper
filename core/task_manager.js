/**
 * @file Task processing module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
(function() {
    var inProgress, tasks,
        i18n = require(__dirname + '/i18n_extend.js'),
        telegram = require(__dirname + '/telegram.js'),
        settings = require(__dirname + '/settings.js'),
        express = require('express'),
        path = require('path'),
        expressApp = express();

    /**
     * Add task to queue
     * @param options {object} Task options
     * @param callback {Function} Function that will be called after telegram sent response
     */
    module.exports.add = function(options, callback) {
        options = JSON.parse(JSON.stringify(options)); // TODO: Find better way to clone objects
        options.callback = callback;
        tasks.push(options);
        // TODO: Save task in DB
    };

    /**
     * Return task length count
     * @returns {Number} Tasks count
     */
    module.exports.queueLength = function() {
        var count = tasks ? tasks.length : 0;

        if (inProgress) {
            ++count;
        }

        return count;
    };

    tasks = []; // TODO: Load tasks from DB

    // Local server to communicate with phantom
    expressApp.use('/iitc', express.static(__dirname + '/../ice_based_server/iitc'));
    expressApp.use('/client', express.static(__dirname + '/../ice_based_server/client'));

    expressApp.get('/get-task', function(req, res) {
        var plugins, lang, resp, latitude, longitude;

        res.setHeader('Access-Control-Allow-Origin', '*');

        if (inProgress) {
            // TODO: Mark previous task as failed in DB
            lang = settings.lang(inProgress.chat);
            resp = i18n(lang, 'tasks', 'something_went_wrong');
            telegram.sendMessage(inProgress.chat, resp, null);
        }

        inProgress = tasks.pop();

        // If no more tasks
        if (!inProgress) {
            res.sendStatus(204);
            return;
        }

        plugins = settings.plugins(inProgress.chat);
        plugins.forEach(function(val, k) {
            plugins[k] = location.origin + '/' + val;
        });
        inProgress.plugins = plugins;


        latitude = inProgress.location.latitude;
        longitude = inProgress.location.longitude;
        inProgress.url = 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=' + inProgress.zoom;

        inProgress.fileName = path.resolve(__dirname + '/../screenshots/task-' + new Date().getTime() + '.png');

        if (inProgress.zoom <= 7) {
            inProgress.timeout = 3 * 60 * 1000;
        } else {
            inProgress.timeout = 2 * 60 * 1000;
        }

        res.send(JSON.stringify(inProgress));
    });

    expressApp.get('/complete-task', function(req, res) {
        var compression;

        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!inProgress) {
            res.sendStatus(400);
            return;
        }

        // TODO: Mark task as finished

        compression = settings.compression(inProgress.chat);
        telegram.sendPhoto(inProgress.chat, inProgress.fileName, compression);

        inProgress = null;
        res.sendStatus(200);
    });

    expressApp.listen(9999);

}());
