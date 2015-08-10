/**
 * @file Settings getters/setters
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var q = require('q'),
    db = require(__dirname + '/db.js'),
    users = {},
    plugins = {};

function getUsers() {
    var dfd = q.defer();

    db.getUsers()
        .then(function(data) {
            data.forEach(function(row) {
                users[row.chat] = row;
            });

            dfd.resolve();
        })
        .fail(dfd.reject);

    return dfd.promise;
}

function getIITCPlugins() {
    var dfd = q.defer();

    db.getIITCPlugins()
        .then(function(data) {
            data.forEach(function(row) {
                plugins[row.chat] = row;
            });

            dfd.resolve();
        })
        .fail(dfd.reject);

    return dfd.promise;
}

function updateUsers() {
    var list = Object.keys(users);

    list.forEach(function(id) {
        var user = users[id];

        if (!user._updated) {
            return;
        }

        if (user._new) {
            delete user._new;
            delete user._updated;

            db
                .createUser(user)
                .fail(function() {
                    user._new = true;
                    user._updated = true;
                });
        } else {
            delete user._updated;

            db
                .updateUser(user)
                .fail(function() {
                    user._updated = true;
                });
        }
    })
}

function updateIITCPlugins() {
    var list = Object.keys(plugins);

    list.forEach(function(id) {
        var row = plugins[id];

        if (!row._updated) {
            return;
        }

        if (row._new) {
            delete row._new;
            delete row._updated;

            db
                .createIITCRow(row)
                .fail(function() {
                    row._new = true;
                    row._updated = true;
                });
        } else {
            delete row._updated;

            db
                .updateIITCRow(row)
                .fail(function() {
                    row._updated = true;
                });
        }
    })
}

setInterval(function() {
    updateUsers();
    updateIITCPlugins();
    console.log('Db updated');
}, 60 * 1000);


module.exports.init = function(cb) {
    q.all([getUsers(), getIITCPlugins()])
        .then(function() {
            if (cb) {
                cb();
            }
        })
        .fail(function() {
            console.log('INIT FAILED');
        })
};

module.exports.profile = function(id, params) {
    var profile;

    if (!users[id]) {
        users[id] = {
            chat: id,
            firstActivity: new Date().getTime(),
            lastActivity: new Date().getTime(),
            screenshotsRequested: 0,
            _new: true
        };
    }

    profile = users[id];

    if (params) {
        if (profile.firstName !== params.first_name) {
            profile.firstName = params.first_name;
        }

        if (profile.lastName !== params.last_name) {
            profile.lastName = params.last_name;
        }

        if (profile.title !== params.title) {
            profile.title = params.title;
        }

        if (profile.username !== params.username) {
            profile.username = params.username;
        }

        profile.lastActivity = new Date().getTime();
        profile._updated = true;
    }

    return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        username: profile.username
    }
};

/**
 * Chat settings
 * @param id {Number} Chat id
 * @param lang {String} Set user language
 * @returns {String|null} Current language code (or null if not defined)
 */
module.exports.lang = function (id, lang) {
    var settings;

    if (!users[id]) {
        users[id] = { chat: id, _new: true };
    }

    settings = users[id];

    if (lang) {
        settings.language = lang;
        settings._updated = true;
    }

    return settings.language || null;
};

/**
 * Compression settings
 * @param id {Number} Chat id
 * @param value {Boolean} Set compression value
 * @returns {Boolean} Value of compression setting
 */
module.exports.compression = function (id, value) {
    var settings;

    if (!users[id]) {
        users[id] = { chat: id, _new: true };
    }

    settings = users[id];

    if (typeof (value) === 'boolean') {
        settings.compression = value;
        settings._updated = true;
    }

    return settings.hasOwnProperty('compression') ? settings.compression : true;
};

/**
 * Plugins settings
 * @param id {Number} Chat id
 * @param value {Array} Set new plugins list
 * @returns {Array} Enabled plugins list
 */
module.exports.plugins = function (id, value) {
    var settings, allPlugins,
        result = [];

    // TODO get from iitc.module.js
    allPlugins = ['iitc', 'missions', 'portalWeakness', 'playerTracker', 'portalNames', 'portalLevels',
        'linkDirections', 'chinaOffset'];

    if (!plugins[id]) {
        plugins[id] = { chat: id, _new: true };
    }

    settings = plugins[id];

    if (value) {
        // Generate new set of data based on value
        settings._updated = true;

        allPlugins.forEach(function(plugin) {
            settings[plugin] = false;
        });

        value.forEach(function(plugin) {
            settings[plugin] = true;
        });

        plugins[id] = settings;
    }

    Object.keys(settings).forEach(function(plugin) {
        if (allPlugins.indexOf(plugin) > -1 && settings[plugin]) {
            result.push(plugin);
        }
    });

    return result;
};