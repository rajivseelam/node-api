var db = appRequire('db');

var migrate = module.exports = {

    make: function (gulp) {
        return db.load().then(function () {
            var args = process.argv.slice(3);
            
            if (args[0] !== '-f' || args[1] === undefined) {
                console.log('Usage => gulp migrate:make -f migrationName')
                return db.close();
            }

            return db.knex.migrate.make(args[1]).then(function () {
                return db.close();
            });
        });
    },

    latest: function (gulp) {
        return db.load().then(function () {
            console.log('Migrating...');

            return db.knex.migrate.latest().then(function (batch) {
                if (batch[0] === 0) {
                    return db.close();
                } else {
                    console.log('Batch: ' + batch[0]);
                    batch[1].forEach(function (file) {
                        console.log(file);
                    });

                    return db.close();
                }
            });
        });
    },

    rollback: function (gulp) {
        return db.load().then(function () {
            console.log('Rolling back...');

            return db.knex.migrate.rollback().then(function (batch) {
                if (batch[0] === 0) {
                    return db.close();
                } else {
                    console.log('Batch: ' + batch[0]);
                    batch[1].forEach(function (file) {
                        console.log(file);
                    });
                    return db.close();
                }
            });
        });
    },

    version: function (gulp) {
        return db.load().then(function () {
            return db.knex.migrate.currentVersion().then(function (version) {
                console.log(version);
                return db.close();
            });
        });
    },

    reset: function (gulp) {
        return db.load().then(function () {
            console.log('Resetting...');

            function reset() {
                return db.knex.migrate.rollback().then(function (batch) {
                    if (batch[0] === 0) {
                        return db.close();
                    } else {
                        console.log('Batch: ' + batch[0]);
                        batch[1].forEach(function (file) {
                            console.log(file);
                        });
                        return reset();
                    }
                });
            };

            return reset();
        });
    },

    refresh: function (gulp) {
        return migrate.reset().then(migrate.latest);
    }

};