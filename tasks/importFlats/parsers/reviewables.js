var Promise = require('bluebird');
var slug = require('slug');
var _ = require('lodash');

var db = appRequire('db');

var titleFieldMap = {
    'Title': 'title',
    'Description': 'description',
    'Options': 'tags',
    'Weight': 'weight',
    'Paying Guest': 'is_pg',
    'Tenant': 'is_tenant',
    'Owner': 'is_owner',
    'Hosteller': 'is_hosteller'
}

var colFieldMap = {};

module.exports = function (row, rowNum) {
    if (rowNum === 0) {
        return parseHeader(row);
    } else {
        return parseRow(row);
    }
};

function parseHeader(row) {
    row.forEach(function (val ,i) {
        colFieldMap[i] = titleFieldMap[val.trim()];
    });

    return Promise.resolve(colFieldMap);
}

function parseRow(row) {
    var models = {
        reviewable: {},
        tags: []
    }

    row.forEach(function (val, i) {
        var field = colFieldMap[i];
        val = val.trim();

        if (field === 'title') {
            models.reviewable.title = val;
            models.reviewable.slug = slug(val.toLowerCase());
        }

        if (field === 'description') {
            models.reviewable.description = val;
        }

        if (field === 'weight') {
            val = isNaN(parseFloat(val)) ? 0 : parseFloat(val);
            models.reviewable.weight = val;
        }

        if (field === 'tags') {
            models.tags = val.split('|').map(function (s) {
                return s.trim();
            }).filter(function (s) {
                return s.length > 0;
            }).map(function (s) {
                return {title: s, slug: slug(s.toLowerCase())};
            });
        }

        if (['is_pg', 'is_owner', 'is_tenant', 'is_hosteller'].indexOf(field) > -1) {
            models[field] = parseInt(val);
        }
    });

    return db('reviewables').find('slug', models.reviewable.slug).then(function (reviewable) {
        if (reviewable) {
            reviewable = _.extend(reviewable, models.reviewable);
        } else {
            reviewable = models.reviewable;
        }

        return db('reviewables').save(reviewable);
    });
}