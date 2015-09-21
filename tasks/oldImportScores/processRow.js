var Promise = require('bluebird');
var _       = require('lodash');
var db      = appRequire('db');

module.exports = function (row, fieldsArray, rowNum) {
    return db.load().then(function () {
        return Promise.all(row.map(function (col, i) {
            if (col.trim().length === 0) {
                return Promise.resolve(col);
            }

            var val = col.split(':')[0].trim();
            var score = col.split(':')[1];
            score = score ? score.trim() : 0;
            var reviewableSlug = fieldsArray[i];

            return db('reviewables').find('slug', reviewableSlug)
                .then(function (reviewable) {
                    return db('review_tags').where('reviewable_id', reviewable.id)
                        .where('value', val).update({
                            score: score
                        });
                });
        }));

    }).then(function () {
        return db.close();
    })
};