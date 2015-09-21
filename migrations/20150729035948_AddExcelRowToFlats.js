
exports.up = function(knex, Promise) {
    return knex.schema.table('flats', function (t) {
        t.integer('csv_row_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('flats', function (t) {
        t.dropColumn('csv_row_id');
    });
};
