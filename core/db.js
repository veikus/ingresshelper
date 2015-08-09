`var q = require('q'),
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

function getPlugins(params) {

}

module.exports.getUsers = getUsers;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;