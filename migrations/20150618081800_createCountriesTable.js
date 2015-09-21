
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('countries', function (t) {
            t.increments('id');
            t.string('name');
            t.string('code');
            t.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('countries')
    ]);
};
