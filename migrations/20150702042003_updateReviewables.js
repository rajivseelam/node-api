
exports.up = function(knex, Promise) {
    return knex.schema.table('reviewables', function (t) {
        t.dropColumn('is_objective');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('reviewables', function (t) {
        t.boolean('is_objective');
    });
};
