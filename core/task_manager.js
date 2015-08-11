/**
 * @file Task processing module
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var tasks,
    i18n = require(__dirname + '/i18n_extend.js'),
    telegram = require(__dirname + '/telegram.js'),
    settings = require(__dirname + '/settings.js'),
    db = require(__dirname + '/db.js'),
    iitc = require(__dirname + '/iitc.module.js'),
    express = require('express'),
    path = require('path'),
    expressApp = express(),
    currentTask = -1;

/**
 * Add task to queue
 * @param options {object} Task options
 */
module.exports.add = function (options) {
    tasks.push({
        chat: options.chat,
        latitude: options.latitude,
        longitude: options.longitude,
        zoom: options.zoom,
        interval: options.interval || false,
        status: 'new',
        created: new Date().getTime()
    });
};

/**
 * Return task length count
 * @returns {Number} Tasks count
 */
module.exports.queueLength = function () {
    var count = 0;

    tasks.forEach(function(task) {
        if (task && task.status === 'new') {
            ++count;
        }
    });

    return count;
};

// Asynchronously load data from db
tasks = [];

db
    .getIncompleteTasks()
    .then(function(data) {
        data.forEach(function(task) {
            tasks.push(task);
        })
    });

// Save data in DB
setInterval(function() {
    tasks.forEach(function(task, i) {
        var method;

        if (!task) {
            return;
        }

        if (task.id && task.status === 'new') {
            return;
        }

        method = task.id ? db.updateTask(task) : db.createTask(task);

        method.then(function(id) {
            if (task.status === 'new') {
                task.id = id;
            } else {
                tasks[i] = null;
            }
        });
    });
}, 60 * 1000);

// Local server to communicate with phantom
expressApp.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

expressApp.use('/iitc', express.static(__dirname + '/../ice_based_server/iitc'));
expressApp.use('/client', express.static(__dirname + '/../ice_based_server/client'));

expressApp.get('/get-task', function (req, res) {
    var plugins, lang, resp, task, file;

    // If previous task is not finished - mark it as failed
    if (tasks[currentTask] && tasks[currentTask].status === 'new') {
        tasks[currentTask].status = 'error';

        lang = settings.lang(tasks[currentTask].chat);
        resp = i18n(lang, 'tasks', 'something_went_wrong');
        telegram.sendMessage(tasks[currentTask].chat, resp, null);
    }

    if (!tasks[currentTask + 1]) {
        // If no more tasks
        res.sendStatus(204);
        return;
    }

    ++currentTask;
    task = tasks[currentTask];

    plugins = settings.plugins(task.chat);

    iitc.idToName(plugins).forEach(function (val, k) {
        plugins[k] = 'http://localhost:9999/iitc/' + val;
    });

    task.plugins = plugins;
    task.url = 'https://www.ingress.com/intel?ll=' + task.latitude + ',' + task.longitude + '&z=' + task.zoom;

    file = __dirname + '/../screenshots/task_' + task.chat + '_' + new Date().getTime() + '.png';
    task.fileName = path.resolve(file);

    if (task.zoom <= 7) {
        task.timeout = 3 * 60 * 1000;
    } else {
        task.timeout = 2 * 60 * 1000;
    }

    res.send(JSON.stringify(task));
});

expressApp.get('/complete-task', function (req, res) {
    var compression, task;

    if (currentTask === -1) {
        return;
    }

    task = tasks[currentTask];
    task.status = 'ok';

    compression = settings.compression(task.chat);
    telegram.sendPhoto(task.chat, task.fileName, compression);

    // TODO: Track send status and block users who blacklisted bot

    res.sendStatus(200);
});

expressApp.listen(9999);
