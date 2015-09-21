var seed = module.exports = function (gulp) {
    var Promise = require('bluebird');
    var db = appRequire('db');
    var config = appRequire('config');
    var args = process.argv.slice(3);
    var seeder = null;

    if (args[0] === '-f' && args[1] !== undefined) {
        seeder = args[1];
    }

    db.load().then(function () {

        if (seeder) {
            return require(config.path('/seeds/'+seeder))().then(function () {
                return console.log(seeder+' seeded');
            });
        } else {
            return Promise.reduce(require(config.path('/seeds')), function (_, seeder) {
                return require(config.path('/seeds/'+seeder))().then(function () {
                    return console.log(seeder+' seeded');
                });
            }, null);
        }
    }).then(function () {
        db.close();
    });
};