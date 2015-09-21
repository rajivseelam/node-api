
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('review_tags', function (t) {
            t.decimal('score', 5, 3).defaultTo(0);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('review_tags', function (t) {
            t.dropColumn('score');
        })
    ]);
};
