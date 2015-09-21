
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('reviewables', function (t) {
            t.decimal('weight', 5, 3).defaultTo(0);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('reviewables', function (t) {
            t.dropColumn('weight');
        })
    ]);
};
