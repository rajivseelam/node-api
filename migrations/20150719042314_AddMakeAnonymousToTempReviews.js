
exports.up = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.boolean('make_anonymous').defaultsTo(false);
        t.integer('review_id').nullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.dropColumn('make_anonymous');
        t.dropColumn('review_id');
    });
};
