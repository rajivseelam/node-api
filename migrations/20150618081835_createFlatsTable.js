
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('flats', function (t) {
            t.increments('id');
            t.json('address', true);
            t.decimal('lat', 10, 6);
            t.decimal('lon', 10, 6);
            t.timestamps();
        }),
        knex.schema.createTable('locality_flat', function (t) {
            t.increments('id');
            t.integer('locality_id');
            t.integer('flat_id');
            t.timestamps();

            t.unique(['locality_id', 'flat_id']);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('flats'),
        knex.schema.dropTable('locality_flat')
    ]);
};
