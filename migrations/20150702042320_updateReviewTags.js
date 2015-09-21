
exports.up = function(knex, Promise) {
    return knex.schema.table('review_tags', function (t) {
        t.dropColumn('sentiment');
        t.renameColumn('value', 'title');
        t.string('slug', 150);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('review_tags', function (t) {
        t.string('sentiment', 10);
        t.renameColumn('title', 'value');
        t.dropColumn('slug');
    });
};
