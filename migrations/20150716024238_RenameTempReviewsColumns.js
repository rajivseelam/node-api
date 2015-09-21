
exports.up = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.renameColumn('residency_type', 'ownership');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.renameColumn('ownership', 'residency_type');
    });
};
