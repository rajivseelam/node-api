exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(t) {
            t.increments('id');
            t.string('username');
            t.string('email');
            t.string('full_name');
            // can add a jsonb field for proper names later
            t.string('plain_password');
            t.string('password');
            t.text('access_token');
            t.json('details', true); // age, gender, phone etc
            t.json('user_location', true); // ask gaur
            t.json('imported_data', true);
            t.json('social_accounts', true);
            t.timestamps();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users')
    ]);
};