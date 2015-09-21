
exports.up = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.dropColumn('user_rating');
        t.dropColumn('payment_method');

        t.boolean('is_from_address');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('temp_flat_reviews', function (t) {
        t.integer('user_rating');
        t.string('payment_method');

        t.dropColumn('is_from_address');
    });
};
