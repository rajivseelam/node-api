
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('cities', function (t) {
            t.increments('id');
            t.integer('country_id').index();
            t.string('name');
            t.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('cities')
    ]);
};
