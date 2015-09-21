
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function (t) {
        t.string('about', 500);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function (t) {
        t.dropColumn('about');
    });
};
