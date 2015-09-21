
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('reviewables', function (t) {
            t.increments('id');
            t.string('title', 100);
            t.string('slug', 150).unique();
            t.string('description', 500);
            t.boolean('is_objective');
            t.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('reviewables')
    ]);
};
