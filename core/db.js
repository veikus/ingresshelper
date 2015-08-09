var q = require('q'),
    mysql = require('mysql'),
    sqlString = require('mysql/lib/protocol/SqlString'),
    pool = mysql.createPool({
        connectionLimit: 3,
        insecureAuth: true,
        connectTimeout: 5000,
        host: 'veikus.mysql.ukraine.com.ua',
        user: 'veikus_ingress',
        password: 'e6y36xs9',
        database: 'veikus_ingress',
        queryFormat: function(sql, values, timeZone) {
            sql = sqlString.format(sql, values, false, timeZone);
            sql = sql.replace(/'NOW\(\)'/g, 'NOW()');
            sql = sql.replace(/'UNIX_TIMESTAMP\(\)'/g, 'UNIX_TIMESTAMP()'); // if you want
            return sql;
        }
    });

// USERS
function getUsers() {
    var dfd = q.defer();

    pool.query('SELECT * from users', function(err, rows) {
        if (err) {
            console.log('getUsers', err);
            dfd.reject();
        } else {
            dfd.resolve(rows);
        }
    });

    return dfd.promise;
}

function createUser(params) {
    var dfd = q.defer();

    pool.query('INSERT INTO users SET ?', params, function(err, rows) {
        if (err) {
            console.log('createUser', err);
            dfd.reject();
        } else {
            dfd.resolve();
        }
    });

    return dfd.promise;
}

function updateUser(params) {
    var dfd = q.defer();

    pool.query('UPDATE users SET ? WHERE chat = ?', [params, params.chat], function(err, rows) {
        if (err) {
            console.log('updateUser', err);
            dfd.reject();
        } else {
            dfd.resolve();
        }
    });

    return dfd.promise;
}

// ITTC
function getIITCPlugins() {
    var dfd = q.defer();

    pool.query('SELECT * from iitc_plugins', function(err, rows) {
        if (err) {
            console.log('getIITCPlugins', err);
            dfd.reject();
        } else {
            dfd.resolve(rows);
        }
    });

    return dfd.promise;
}

function createIITCRow(params) {
    var dfd = q.defer();

    pool.query('INSERT INTO iitc_plugins SET ?', params, function(err, rows) {
        if (err) {
            console.log('createIITCRow', err);
            dfd.reject();
        } else {
            dfd.resolve();
        }
    });

    return dfd.promise;
}

function updateIITCRow(params) {
    var dfd = q.defer();

    pool.query('UPDATE iitc_plugins SET ? WHERE chat = ?', [params, params.chat], function(err, rows) {
        if (err) {
            console.log('updateIITCRow', err);
            dfd.reject();
        } else {
            dfd.resolve();
        }
    });

    return dfd.promise;
}

module.exports.getUsers = getUsers;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.getIITCPlugins = getIITCPlugins;
module.exports.createIITCRow = createIITCRow;
module.exports.updateIITCRow = updateIITCRow;