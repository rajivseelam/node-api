var Promise = require('bluebird');
var _       = require('lodash');
var db      = appRequire('db');

module.exports = function (headers, fieldsArray, rowNum) {
    return db.load().then(function () {
        return Promise.all(headers.map(function (col) {
            var field = col.split(':')[0].trim();
            var weight = col.split(':')[1].trim();

            fieldsArray.push(field);

            return db('reviewables').where('slug', field).update({
                weight: weight
            });
        }));
    }).then(function () {
        return db.close();
    });
};