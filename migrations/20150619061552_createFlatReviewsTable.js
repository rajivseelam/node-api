
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('flat_reviews', function (t) {
            t.increments('id');
            t.integer('user_id');
            t.integer('flat_id');
            t.date('moved_in_on').nullable();
            t.date('moved_out_on').nullable();
            t.string('residency_type', 50);
            t.string('remarks', 500);
            t.integer('user_rating').nullable();
            t.integer('flatabout_rating').nullable();
            t.timestamps();

            t.unique(['user_id', 'flat_id']);
            t.index('flat_id');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('flat_reviews')
    ]);
};
