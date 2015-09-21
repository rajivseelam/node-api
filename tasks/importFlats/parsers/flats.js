var Promise = require('bluebird');
var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');
var faker = require('faker');
var bcrypt = require('bcryptjs');

var db = appRequire('db');
var config = appRequire('config');

// special case 'Not Allowed'

// anything not in this map is a reviewable
var titleStaticFieldMap = {
    'Timestamp': 'created_at',
    'Name': 'full_name',
    'Email': 'email',
    'Mobile': 'mobile',
    'Full Address': 'full_address',
    'Ownership': 'ownership',
    'Rent': 'rent',
    'Additional Remarks': 'remarks',
    'Our remarks': 'summary',
    'Overall Experience': 'color',
    'Summary': 'flatabout_remarks',
    'Key': 'key'
};

var colorMap = {
    'green': 'green',
    'orange': 'yellow',
    'red': 'red'
};

// will hold map of column indices to title
// and of column indices to reviewable objects
var columnFieldMap = {};

function resetInvalidTagsLog() {
    fs.writeFileSync(config.path('/tasks/importFlats/invalidTagsLog'), '');
};

module.exports = function (row, rowNum) {
    resetInvalidTagsLog();

    if (rowNum === 0) {
        return parseHeader(row, rowNum);
    } else {
        return parseRow(row, rowNum);
    }
};

function parseHeader(row, rowNum) {
    return Promise.all(row.map(function (val, i) {
        val = val.trim();
        var field = titleStaticFieldMap[val];

        if (field) {
            return Promise.resolve(field);
        } else {
            if (val === 'Not Allowed') {
                val = 'Allowed';
            }

            // now we know we are accessing a reviewable
            return db('reviewables').whereRaw('lower(title) = lower(?)', [val]).first()
                .then(function (reviewable) {
                    if (! reviewable) {
                        throw 'invalid column header : ' + val;
                    }

                    return reviewable
                });
        }
    })).then(function (fields) {
        fields.forEach(function (field, i) {
            columnFieldMap[i] = field;
        });
    });
}
/*
var titleStaticFieldMap = {
    'Timestamp': 'created_at',
    'Name': 'full_name',
    'Email': 'email',
    'Mobile': 'mobile',
    'Full Address': 'full_address',
    'Ownership': 'ownership',
    'Rent': 'rent',
    'Additional Remarks': 'remarks'
};
*/

function parseRow(row, rowNum) {
    var models = {
        flat: {
            csv_row_id: rowNum
        },
        user: {},
        review: {},
        review_tags: []
    };

    row.forEach(function (val, i) {
        var field = columnFieldMap[i];
        val = val.trim();

        if (_.values(titleStaticFieldMap).indexOf(field) > -1) {
            // we are dealing with statics
            if (field === 'created_at') {
                var date = moment('6/19/2015 0:52', 'M/D/YYYY H:ss').toDate();
                date = date instanceof Date ? date : new Date;
                models.review.created_at = date;
            }

            if (field === 'full_name') {
                models.user.full_name = val;
            }

            if (field === 'email') {
                models.user.email = val;
            }

            if (field === 'mobile') {
                if (! models.user.details) {
                    models.user.details = {};
                }

                models.user.details.mobile = val;
            }

            if (field === 'full_address') {
                if (! models.flat.address) {
                    models.flat.address = {};
                }
                models.flat.address.full = val;
                var geo = generateRandomLatLon(15000);
                models.flat.lat = geo.lat;
                models.flat.lon = geo.lon;
            }

            if (field === 'ownership') {
                models.review.ownership = val;
            }

            if (field === 'rent') {
                var rent =  parseInt(val);
                rent = isNaN(rent) ? null : rent;
                models.review.rent = rent;
            }

            if (field === 'remarks') {
                models.review.remarks = val;
            }

            if (field === 'flatabout_remarks') {
                models.review.flatabout_remarks = val;
            }

            if (field === 'color') {
                models.flat.color = colorMap[val.toLowerCase()];
            }
        } else {
            // we are dealing with 
            // review_tags and our fields are
            // reviewables
            var reviewable = field;
            var tags = val.split('|').map(function (s) {
                return s.trim();
            }).filter(function (s) {
                return s.length > 0;
            });

            tags.forEach(function (t) {
                models.review_tags.push({
                    reviewable: reviewable,
                    reviewable_id: reviewable.id,
                    title: t
                });
            });
        }
    });

    return Promise.props({
        flat: (function () {
            return db('flats').find("address->>'full'", models.flat.address.full)
                .then(function (flat) {
                    if (flat) {
                        return flat;
                    } else {
                        return db('flats').save(models.flat);
                    }
                });
        }()),
        user: (function () {
            return db('users').find('email', models.user.email)
                .then(function (user) {
                    if (user) {
                        return user;
                    } else {
                        var password = faker.internet.password();
                        return db('users').save({
                            full_name     : models.user.full_name,
                            email         : models.user.email,
                            username      : models.user.email.split('@')[0],
                            password      : bcrypt.hashSync(password),
                            plain_password: password,
                            details       : models.user.details
                        });
                    }
                })
        }()),
        tags: (function () {
            return Promise.all(models.review_tags.map(function (t) {
                return db('review_tags').where('reviewable_id', t.reviewable_id)
                    .whereRaw('lower(title) = lower(?)', [t.title])
                    .first().then(function (tag) {
                        if (tag) {
                            return tag;
                        } else {
                            logTag(rowNum, t.reviewable.title, t.title);
                        }
                    })
            })).then(function (tags) {
                return tags.filter(function (t) {
                    return !!t;
                });
            }).then(function (tags) {
                return db('review_tags').eagerLoad(['reviewable'])  
                    .whereIn('id', _.pluck(tags, 'id')).all();
            });
        }())
    }).then(function (data) {
        return db('flat_reviews').where({
            user_id: data.user.id,
            flat_id: data.flat.id
        }).first().then(function (review) {
            if (! review) {
                review = {};
            }

            _.extend(review, {
                user_id          : data.user.id,
                flat_id          : data.flat.id,
                ownership        : models.review.ownership,
                flatabout_remarks: models.review.flatabout_remarks,
                rent             : models.review.rent,
                remarks          : models.review.remarks,
                created_at       : models.review.created_at,
                moved_in_on      : moment().subtract(1, 'y').toDate(),
                moved_out_on     : moment().subtract(2, 'M').toDate()
            });

            return db('flat_reviews').save(review).then(function (review) {
                return db('flat_reviews').eagerLoad(['tags']).find(review.id);
            });
        }).then(function (review) {
            function attachNormalTags() {
                return Promise.all(data.tags.filter(function (t) {
                    return t.reviewable.title !== 'Allowed';
                }).map(function (t) {
                    if (_.pluck(review.tags, 'id').indexOf(t.id) === -1) {
                        return db('flat_reviews').tags(review).attach(t);
                    }
                }));
            };

            function attachAllowedTags() {
                var notAllowedTags = data.tags.filter(function (t) {
                    return t.reviewable.title === 'Allowed';
                });

                return db('reviewables').eagerLoad(['tags']).find('title', 'Allowed')
                    .then(function (allowedReviewable) {
                        return db('review_tags').where('reviewable_id', allowedReviewable.id)
                            .whereNotIn('id', notAllowedTags.map(function (t) { return t.id; }))
                            .all().then(function (allowedTags) {
                                return Promise.all(allowedTags.map(function (t) {
                                    return db('flat_reviews').tags(review).attach(t);
                                }));
                            });
                    });

                if (notAllowedTags.length === 0) {
                    return Promise.resolve();
                }

                var allowedReviewable = notAllowedTags[0].reviewable;
            };

            return Promise.all([
                attachNormalTags(),
                attachAllowedTags()
            ]);
        });
    });
}

function generateRandomLatLon(metres) {
    var origin = {
        lat: 28.5335197,
        lon: 77.21088569999999
    };

    metres = parseInt(metres);
    metres = isNaN(metres) ? 5 * 1000 : metres;

    var r = metres/111300;

    var u = Math.random();
    var v = Math.random();
    var w = r * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y1 = w * Math.sin(t);
    var x1 = x / Math.cos(origin.lat);

    return {
        lat: origin.lat + y1,
        lon: origin.lon + x1
    };
};

function logTag(rowNum, reviewable, tag) {
    var tagLog = config.path('/tasks/importFlats/invalidTagsLog');

    fs.appendFileSync(tagLog, [rowNum, reviewable, tag].join('#') + '\n');
}