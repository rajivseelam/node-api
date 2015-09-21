var Promise = require('bluebird');
var faker = require('faker');

var db = appRequire('db');
var range = appRequire('util/range');

module.exports = function () {
    return db('countries').find('code', 'IN').then(function (country) {
        return Promise.all(range(1,20).map(function () {
            return db('cities').save({
                country_id: country.id,
                name      : faker.address.city()
            });
        }));
    });
};