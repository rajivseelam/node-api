
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('localities', function (t) {
            t.increments('id');
            t.integer('city_id').index();
            t.integer('parent_id').nullable();
            t.string('name');
            t.json('pincode', true);
            t.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('localities')
    ]);
};
