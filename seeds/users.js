var uuid = require('uuid');
var faker = require('faker');
var bcrypt = require('bcryptjs');
var Promise = require('bluebird');

var range = appRequire('util/range');
var db = appRequire('db');

module.exports = function() {
    return db('users').truncate().then(function() {
        return Promise.all(range(1, 10).map(function(n) {
            var password = faker.internet.password();
            return db('users').insert({
                username      : faker.internet.userName(),
                email         : faker.internet.email(),
                full_name     : faker.name.firstName() + ' ' + faker.name.lastName(),
                password      : bcrypt.hashSync(password),
                plain_password: password,
                social_accounts:{ "facebook_id": uuid(),
                                   "twitter_id": uuid(),
                                    "googleplus_id" : uuid()
                                },
                user_location : {"lat": 33.33, "lng": 77.61},
                details       : {
                    age   :faker.helpers.randomNumber(19, 60),
                    gender: n % 2 === 0 ? 'M' : 'F',
                },
                imported_data : faker.helpers.contextualCard()
            });
        }));
    });
};