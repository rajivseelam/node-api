var Promise = require('bluebird');
var slug = require('slug');
var _ = require('lodash');

var db = appRequire('db');

var titleFieldMap = {
    'Reviewable': 'reviewable',
    'Tags': 'tag',
    'Questions': 'description',
    'Score': 'score',
    'Paying Guest': 'is_pg',
    'Tenant': 'is_tenant',
    'Owner': 'is_owner',
    'Hosteller': 'is_hosteller'
};

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
        tag: {},
        reviewable: {}
    }

    row.forEach(function (val, i) {
        var field = colFieldMap[i];
        val = val.trim();

        if (field === 'reviewable') {
            models.reviewable.title = val;
        }

        if (field === 'tag') {
            models.tag.title = val;
            models.tag.slug = slug(val.toLowerCase());
        }

        if (field === 'description') {
            models.tag.description = val;
        }

        if (field === 'score') {
            val = isNaN(parseFloat(val)) ? 0 : parseFloat(val);
            models.tag.score = val;
        }

        if (['is_pg', 'is_owner', 'is_tenant', 'is_hosteller'].indexOf(field) > -1) {
            models[field] = parseInt(val);
        }
    });

    return db('reviewables').whereRaw('lower(title) = lower(?)', [models.reviewable.title])
            .first().then(function (reviewable) {
                if (! reviewable) {
                    throw 'Invalid Reviewable found : ' + models.reviewable.title;
                }

                return db('review_tags')
                    .where('reviewable_id', reviewable.id)
                    .whereRaw('lower(title) = lower(?)', [models.tag.title])
                    .first().then(function (tag) {
                        if (! tag) {
                            tag = _.extend({reviewable_id: reviewable.id}, models.tag)
                        } else {
                            tag = _.extend(tag, {reviewable_id: reviewable.id}, models.tag)
                        }

                        return db('review_tags').save(tag);
                    });
            });
}

