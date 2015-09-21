var Promise = require('bluebird');
var _       = require('lodash');
var request = require('request-promise');
var moment  = require('moment');
var slug    = require('slug');
var uuid    = require('uuid');
var crc     = require('crc');
var qs      = require('querystring');
var fs      = require('fs');
var faker   = require('faker');
var bcrypt  = require('bcryptjs');
var config  = appRequire('config');
var db      = appRequire('db');

module.exports = processRow;

function processRow(row, staticFields, dynamicFields, fieldsArray, rowNum) {
    var models = {
        flat: {},
        user: {},
        review: {},
        review_tags: []
    };

    var promises = [];

    return Promise.all(row.map(function (val, i) {
        var field = fieldsArray[i];
        var staticFields = _.keys(staticFields);

        if (field === 'review_date') {
            models.review.created_at = moment(/* do shit to get moment from val */).toDate();
        }

        if (field === 'residency_type') {
            models.review.residency_type = val;
        }

        if (field === 'name') {
            models.user.full_name = val;
        }

        if (field === 'email') {
            models.user.email = val;
        }

        if (field === 'phone_number') {
            if (_.isUndefined(models.user.details)) {
                models.user.details = {};
            }

            models.user.details.phone_number = val;
        }

        if (field === 'address') {
            // we need to get lat lon from google geocoding thing
            models.flat.address = val;
            var geo = generateRandomLatLon(5000);
            models.flat.lat = geo.lat;
            models.flat.lon = geo.lon;

            /**
             * leave out the request part for now
             */
            
            /**
            var req = request({
                json  : true,
                method: 'GET',
                uri   : 'https://maps.googleapis.com/maps/api/geocode/json',
                qs    : {
                    key: 'AIzaSyBVjuZ5Ip0o2pXysQClJmhf6ixy5rDA0EE',
                    address: val
                },
                agentOptions: {
                    secureProtocol: 'SSLv3_method'
                }
            });
            
            console.log('requesting');
            req.then(function (data) {
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    logLatLon(models.flat.lat, models.flat.lon, rowNum);
                } else {
                    throw data;
                }
            }).catch(function (e) {
                logInvalidAddress(val, rowNum);
            }).finally(function () {
                console.log('done');
                var geo = generateRandomLatLon(5000);
                models.flat.lat = geo.lat;
                models.flat.lon = geo.lon;
            });
            
            promises.push(req);
            **/

            promises.push(Promise.resolve(models.flat));
        };

        if (field === 'remarks') {
            models.review.remarks = val;
        }

        // for all other fields, we assume we are dealing with review tags
        if (_.keys(dynamicFields).indexOf(field) > -1) {
            var tags = val.split(',').map(function (t) { return t.trim(); });

            tags.forEach(function (t) {
                models.review_tags.push({
                    slug: field,
                    val: t
                });
            });
        }

        return Promise.all(promises);
    })).then(function () {
        return db.load();
    }).then(function () {
        return saveModels(models);
    }).then(function () {
        return db.close();
    });
};

function logInvalidAddress(address, rowNum) {
    var invalidAddressesLog = config.path('/tasks/csvToFlats/invalidAddressesLog');

    var str = [
        rowNum,
        '-----------',
        address,
        '---------------------------------------------------------------'
    ].join('\n');


    fs.appendFileSync(invalidAddressesLog, str+'\n');
};

function logLatLon(lat, lon, rowNum) {
    var latLonLog = config.path('/tasks/csvToFlats/latLonLog');

    var str = [
        rowNum,
        [lat, lon].join(',')
    ].join(' : ');

    fs.appendFileSync(latLonLog, str+'\n');
};

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


function saveModels(models) {
    /*
        var models = {
            flat: {},
            user: {},
            review: {},
            review_tags: []
        };
     */
    return Promise.props({
        flat: (function () {
            return db('flats').find("address->>'full'", models.flat.address)
                .then(function (flat) {
                    if (flat) {
                        return flat;
                    } else {
                        return db('flats').save({
                            lat: models.flat.lat,
                            lon: models.flat.lon,
                            address: {
                                full: models.flat.address
                            }
                        });
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
                });
        }())
    }).then(function (data) {
        return db('flat_reviews')
                .where('user_id', data.user.id)
                .where('flat_id', data.flat.id)
                .first().then(function (review) {
                    if (! review) {
                        review = {};
                    }

                    _.extend(review, {
                        user_id       : data.user.id,
                        flat_id       : data.flat.id,
                        residency_type: models.review.residency_type,
                        remarks       : models.review.remarks,
                        moved_in_on   : moment().subtract(1, 'y').toDate(),
                        moved_out_on  : moment().subtract(2, 'M').toDate()
                    });

                    return db('flat_reviews').save(review).then(function (review) {
                        data.review = review;
                        return data;
                    });
                });
    }).then(function (data) {
        // we will process tags here
        return Promise.all(models.review_tags.map(function (t) {
            return db('reviewables').find('slug', t.slug)
                .then(function (reviewable) {
                    return db('review_tags').where('reviewable_id', '=', reviewable.id)
                        .where('value', t.val).first()
                        .then(function (reviewTag) {
                            if (! reviewTag) {
                                reviewTag = {};
                            }

                            _.extend(reviewTag, {
                                reviewable_id: reviewable.id,
                                value        : t.val,
                                sentiment    : 'neutral'        
                            })

                            return db('review_tags').save(reviewTag);
                        });
                });
        })).then(function (tags) {
            var tagIds = tags.map(function (t) { return t.id; });

            return db('review_tags').whereIn('id', tagIds).all().then(function (tags) {
                return Promise.all(tags.map(function (t) {
                    return db('flat_review_tag').where('review_id', data.review.id)
                        .where('tag_id', t.id).first()
                        .then(function (pivot) {
                            if (! pivot) {
                                pivot = {};
                            }

                            _.extend(pivot, {
                                review_id: data.review.id,
                                tag_id   : t.id
                            });

                            return db('flat_review_tag').save(pivot);
                        });
                }));
            });
        });
    });
}