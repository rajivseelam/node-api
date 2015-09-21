var _ = require('lodash');


exports.up = function(knex, Promise) {
    return knex('review_tags').then(function (rows) {
        return knex.schema.table('review_tags', function (t) {
            t.dropColumn('data');
        }).then(function () {
            return rows.map(function (row) {
                return _.transform(row, function (r, v, k) {
                    if (k === 'data') {
                        r.value       = v.val;
                        r.description = v.description;
                    } else {
                        r[k] = v;
                    }
                });
            });
        });
    }).then(function (rows) {
        return knex.schema.table('review_tags', function (t) {
            t.string('value', 100);
            t.string('description').nullable();
        }).then(function () {
            return rows;
        });
    }).then(function (rows) {
        return Promise.all(rows.map(function (r) {
            return knex('review_tags').where('id', r.id).update({
                value      : r.value,
                description: r.description
            });
        }));
    });
};

exports.down = function(knex, Promise) {
    return knex('review_tags').then(function (rows) {
        return knex.schema.table('review_tags', function (t) {
            t.dropColumn('value');
            t.dropColumn('description');
        }).then(function () {
            return rows.map(function (row) {
                return _.transform(row, function (r, v, k) {
                    if (k === 'value' || k === 'description') {
                        r.data = r.data || {};
                        if (k === 'value') {
                            r.data.val = v;
                        } else {
                            r.data.description = v;
                        }
                    } else {
                        r[k] = v;
                    }
                });
            });
        });
    }).then(function (rows) {
        return knex.schema.table('review_tags', function (t) {
            t.json('data', true);
        }).then(function () {
            return rows;
        });
    }).then(function (rows) {
        return Promise.all(rows.map(function (r) {
            return knex('review_tags').where('id', r.id).update({
                data: r.data
            });
        }));
    });
};
