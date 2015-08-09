/**
 * @file Settings getters/setters
 * @author Artem Veikus artem@veikus.com
 * @version 3.0
 */
var q = require('q'),
    db = require(__dirname + '/db.js'),
    users = {};


function getUsers() {
    var dfd = q.defer();

    db.getUsers()
        .then(function(data) {
            data.forEach(function(user) {
                users[user.chat] = user;
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

setInterval(function() {
    updateUsers();
    console.log('Db updated');
}, 60 * 1000);


module.exports.init = function(cb) {
    q.all([getUsers()])
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
        users[id] = { chat: id, _new: true };
    }

    profile = users[id];

    if (params) {
        if (profile.first_name !== params.first_name) {
            profile.first_name =  params.first_name;
            profile._updated = true;
        }

        if (profile.last_name !== params.last_name) {
            profile.last_name =  params.last_name;
            profile._updated = true;
        }

        if (profile.title !== params.title) {
            profile.title =  params.title;
            profile._updated = true;
        }

        if (profile.username !== params.username) {
            profile.username =  params.username;
            profile._updated = true;
        }
    }

    return {
        first_name: profile.first_name,
        last_name: profile.last_name,
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
    return [];
};