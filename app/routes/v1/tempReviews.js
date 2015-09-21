var app = module.exports = require('express')();
var moment = require('moment');
var Promise = require('bluebird');
var _ = require('lodash');
var passport = require('passport');

var db = appRequire('db');
var view = appRequire('view').prefix('v1');

var range = appRequire('util/range');

var tempReviewExists = appRequire('util/filters').tempReviewExists;
var tempReviewAndTagExist = appRequire('util/filters').tempReviewAndTagExist;

var authFilter = passport.authenticate('bearer', {
    session: false
});

app.get('/', authFilter, function (req, res) {
    var page = parseInt(req.query.page);
    page = isNaN(page) ? 1 : page;

    db('temp_flat_reviews').eagerLoad(['user'])
        .orderBy('created_at', 'desc').forPage(page).all()
        .then(function (reviews) {
            res.view('tempReviews/list', reviews);
        });
});

app.get('/:id', authFilter, function (req, res) {
    db('temp_flat_reviews').eagerLoad(['tags', 'user']).find(req.params.id)
        .then(function (review) {
            if (review) {
                res.view('tempReviews/model', review);
            } else {
                res.status(404).send({msg: 'Not Found'});
            }
        });
});

app.post('/', authFilter, function (req, res) {
    var data = {
        user_id       : req.user.id,
        rent          : req.body.data.rent,
        lat           : req.body.data.lat || null,
        lon           : req.body.data.lon || null,
        remarks       : req.body.data.remarks,
        user_rating   : req.body.data.user_rating || null,
        make_anonymous: req.body.data.make_anonymous || false,
        is_from_address: req.body.data.is_from_address || false,
        moved_in_on   : (
            req.body.data.moved_in_on ? moment(new Date(req.body.data.moved_in_on)).toDate() : null
        ),
        moved_out_on  : (
            req.body.data.moved_out_on ? moment(new Date(req.body.data.moved_out_on)).toDate() : null
        ),
        address       : {
            full             : req.body.data.address.full,
            flat_number      : req.body.data.address.flat_number,
            floor            : req.body.data.address.floor,
            building         : req.body.data.address.building,
            street_or_society: req.body.data.address.street_or_society,
            locality         : req.body.data.address.locality,
            pincode          : req.body.data.address.pincode
        }
    };

    var inputTagIds = _.isArray(req.body.data.tag_ids) ? req.body.data.tag_ids : [];
    var tagIds = [];

    inputTagIds.forEach(function (id) {
        if (tagIds.indexOf(id) === -1) {
            tagIds.push(id);
        }
    });

    return db.trx(function (t) {
        return db('temp_flat_reviews', t).save(data).then(function (review) {
            return db('temp_flat_reviews', t).tags(review).sync(tagIds).then(function () {
                return review;
            });
        });
    }).then(function (review) {
        res.view('tempReviews/model', review);
    }).catch(function (e) {
        res.status(500).send({msg: 'Something went wrong, contact a dev'});
    });
});

app.put('/:reviewId', authFilter, tempReviewExists, function (req, res) {
    var data = _.assign(req.resolved.review, {
        rent            : req.body.data.rent,
        lat             : req.body.data.lat || null,
        lon             : req.body.data.lon || null,
        remarks         : req.body.data.remarks,
        user_rating     : req.body.data.user_rating || null,
        flatabout_rating: req.body.data.flatabout_rating || null,
        make_anonymous  : req.body.data.make_anonymous || false,
        moved_in_on     : (
            req.body.data.moved_in_on ? moment(new Date(req.body.data.moved_in_on)).toDate() : null
        ),
        moved_out_on    : (
            req.body.data.moved_out_on ? moment(new Date(req.body.data.moved_out_on)).toDate() : null
        ),
        address         : {
            full             : req.body.data.address.full,
            flat_number      : req.body.data.address.flat_number,
            floor            : req.body.data.address.floor,
            building         : req.body.data.address.building,
            street_or_society: req.body.data.address.street_or_society,
            locality         : req.body.data.address.locality,
            pincode          : req.body.data.address.pincode
        }
    });

    return db('temp_flat_reviews').save(data).then(function (review) {
        if (_.isArray(req.body.data.tag_ids)) {
            return db('temp_flat_reviews').tags(review).sync(req.body.data.tag_ids)
                .then(function () {
                    return review;
                });
        } else {
            return review;
        }
    }).then(function (review) {
        res.view('tempReviews/model', review);
    }).catch(function (e) {
        res.status(404).send({msg: 'Something went wrong, contact a dev'});
    });
});

app.put('/:reviewId/tags/:tagId', tempReviewAndTagExist, function (req, res) {
    db('temp_flat_review_tag')
        .where('review_id', req.params.reviewId)
        .where('tag_id', req.params.tagId)
        .first().then(function (pivot) {
            if (pivot) {
                res.status(200).send({msg: 'Tag already attached'});
            } else {
                return db('temp_flat_review_tag').save({
                    review_id: req.params.reviewId,
                    tag_id   : req.params.tagId
                }).then(function (pivot) {
                    res.status(200).send({msg: 'Tag attached'});
                });
            }
        }).catch(function (e) {
            res.status(400).send({msg: 'Something went wrong, contact a dev'});
        });
});

app.delete('/:reviewId/tags/:tagId', tempReviewAndTagExist, function (req, res) {
    db('temp_flat_review_tag')
        .where('review_id', req.params.reviewId)
        .where('tag_id', req.params.tagId)
        .first().then(function (pivot) {
            if (! pivot) {
                res.status(200).send({msg: 'Tag already detached'});
            } else {
                return db('temp_flat_review_tag').del(pivot.id)
                    .then(function (pivot) {
                        res.status(200).send({msg: 'Tag detached'});
                    });
            }
        }).catch(function (e) {
            res.status(400).send({msg: 'Something went wrong, contact a dev'});
        });
});

app.post('/:reviewId/export', authFilter, tempReviewExists, function (req, res) {
    return Promise.props({
            tempReview: db('temp_flat_reviews').eagerLoad(['tags']).find('id', req.params.reviewId),
            userRatingReviewable: db('reviewables').find('title', 'User Rating')
        }).then(function (data) {
            var tempReview = data.tempReview;
            var userRatingReviewable = data.userRatingReviewable;
            tempReview.address.full = [
                tempReview.address.flat_number,
                tempReview.address.locality
            ].join(', ');
            return db('flats').find("address->>'full'", tempReview.address.full)
                .then(function (flat) {
                    if (flat) {
                        return flat;
                    } else {
                        // set default color to yellow
                        var color = 'yellow';

                        var ratingColorMap = {
                            'Excellent': 'green',
                            'Average': 'yellow',
                            'Poor': 'red'
                        };

                        tempReview.tags.forEach(function (t) {
                            if (t.reviewable_id === userRatingReviewable.id) {
                                color = ratingColorMap[t.title];
                            }
                        });

                        return db('flats').save({
                            address: tempReview.address,
                            lat: tempReview.lat,
                            lon: tempReview.lon,
                            color: color
                        });
                    }
                });
        }).then(function (flat) {
            var tagIds = _.pluck(tempReview.tags, 'id');
            var data = {};
            _.extend(data, _.omit(tempReview, ['id']), {
                'flat_id': flat.id
            });
            return db('flat_reviews').save(data).then(function (review) {
                return db('flat_reviews').tags(review).sync(tagIds)
                    .then(function (tags) {
                        return review;
                    });
            });
    }).then(function (review) {
        return db('temp_flat_reviews').del(req.params.reviewId)
            .then(function (status) {
                res.status(201).view('reviews/model', review);
            });
    }).catch(function (e) {
        res.status(500).send({
            msg: 'error:: ' + e
        });
    });
});

app.post('/export/batch', authFilter, function (req, res) {
        var batchReviewIds = _.sortBy(req.body.batchIds, function(num) {
            return num;
        });

        db.trx(function(t) {
            return Promise.all(batchReviewIds.map(function(n) {
                return db('temp_flat_reviews', t).eagerLoad(['tags']).find('id', n)
                    .then(function(review) {
                        return db('flats', t).find("address->>'full'", review.address.full)
                            .then(function(flat) {
                                if (flat) {
                                    return flat;
                                } else {
                                    return db('flats', t).save({
                                        address: review.address,
                                        lat: review.lat,
                                        lon: review.lon
                                    });
                                }
                            }).then(function(flat) {
                                var tagIds = _.pluck(review.tags, 'id');
                                var data = {};
                                _.extend(data, _.omit(review, ['id']), {
                                    'flat_id': flat.id
                                });
                                return db('flat_reviews', t).save(data).then(function(review) {
                                    return db('flat_reviews', t).tags(review).sync(tagIds)
                                        .then(function(tags) {
                                            return review;
                                        });
                                });
                            });
                    });
            }));
        }).then(function (review) {
            Promise.all(batchReviewIds.map(function(i) {
                return db('temp_flat_reviews').del(i);
            })).then(function(status) {
                return res.status(201).view('reviews/list', review);
            });
        }).catch(function(e) {
            console.log(e);
            return res.status(500).send({msg: "Failed to Export Given Data"});
        });
});

app.delete('/:reviewId', authFilter, tempReviewExists, function (req, res) {
    return db.trx(function (t) {
        return Promise.all([
            db('temp_flat_review_tag', t).where('review_id', req.params.reviewId).del(),
            db('temp_flat_reviews', t).del(req.params.reviewId)
        ]);
    }).then(function (status) {
        res.status(204).send({msg: 'temp review deleted'});
    }).catch(function (e) {
        res.status(500).send({
            msg: 'Error::' + e
        });
    });
});