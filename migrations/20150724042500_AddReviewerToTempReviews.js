
exports.up = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.string('reviewer');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.dropColumn('reviewer');
    });
};
