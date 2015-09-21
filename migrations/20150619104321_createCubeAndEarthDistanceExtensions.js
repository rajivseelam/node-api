
exports.up = function(knex, Promise) {
    return knex.schema.raw('create extension cube')
        .then(function () {
            return knex.schema.raw('create extension earthdistance');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema.raw('drop extension earthdistance')
        .then(function () {
            return knex.schema.raw('drop extension cube');
        });
};
