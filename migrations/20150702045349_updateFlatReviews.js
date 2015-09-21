
exports.up = function(knex, Promise) {
    return knex.schema.table('flat_reviews', function (t) {
        t.renameColumn('residency_type', 'ownership');
        t.integer('rent').nullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('flat_reviews', function (t) {
        t.renameColumn('ownership', 'residency_type');
        t.dropColumn('rent');
    });
};
