
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('review_tags', function (t) {
            t.increments('id');
            t.integer('reviewable_id').index();
            t.json('data', true);
            t.string('sentiment', 10).nullable();
            t.timestamps();
        }),
        knex.schema.createTable('flat_review_tag', function (t) {
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
        knex.schema.dropTable('review_tags'),
        knex.schema.dropTable('flat_review_tag')
    ]);
};
