
exports.up = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.dropColumn('reviewer');
        t.dropColumn('ownership');
        t.integer('rent');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.string('reviewer');
        t.string('ownership');
        t.dropColumn('rent');
    });
};
