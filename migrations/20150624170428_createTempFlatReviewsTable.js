
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('temp_flat_reviews', function (t) {
            t.increments('id');
            t.integer('user_id').index();
            t.json('address', true);
            t.decimal('lat', 10, 6).nullable();
            t.decimal('lon', 10, 6).nullable();
            t.date('moved_in_on').nullable();
            t.date('moved_out_on').nullable();
            t.string('residency_type', 50);
            t.string('remarks', 500);
            t.integer('user_rating').nullable();
            t.integer('flatabout_rating').nullable();
            t.timestamps();
        }),
        knex.schema.createTable('temp_flat_review_tag', function (t) {
            t.increments('id');
            t.integer('review_id');
            t.integer('tag_id');
            t.timestamps();

            t.unique(['review_id', 'tag_id']);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('temp_flat_reviews'),
        knex.schema.dropTable('temp_flat_review_tag')
    ]);
};
