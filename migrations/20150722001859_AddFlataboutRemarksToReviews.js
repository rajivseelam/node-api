
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('flat_reviews', function (t) {
            t.string('flatabout_remarks');
        }),
        knex.schema.table('flats', function (t) {
            t.string('color');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('flat_reviews', function (t) {
            t.dropColumn('flatabout_remarks');
        }),
        knex.schema.table('flats', function (t) {
            t.dropColumn('color');
        })
    ]);
};