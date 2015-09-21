var _ = require('lodash');
var Promise = require('bluebird');

var db = appRequire('db');

function initResolved(req) {
    req.resolved = _.isUndefined(req.resolved) ? {} : req.resolved;
};

var filters = module.exports = {
    userAlreadyExists: function(req, res, next) {
        return db('users').find('email', req.body.email)
            .then(function(user) {
                if (user) {
                    res.status(400).send({
                        message: "user already exsists"
                    });
                } else {
                    next();
                }
            });
    },

    flatExists: function (req, res, next) {
        initResolved(req);

        db('flats').find(req.params.flatId)
            .then(function (flat) {
                if (flat) {
                    req.resolved.flat = flat;
                    next();
                } else {
                    res.status(404).send({msg: 'Not Found'});
                }
            });
    },

    reviewExists: function (req, res, next) {
        initResolved(req);

        db('flat_reviews').find(req.params.reviewId)
            .then(function (review) {
                if (review) {
                    req.resolved.review = review;
                    next();
                } else {
                    res.status(404).send({msg: 'Not Found'});
                }
            });
    },

    tempReviewExists: function (req, res, next) {
        initResolved(req);

        db('temp_flat_reviews').find(req.params.reviewId)
            .then(function (review) {
                if (review) {
                    req.resolved.review = review;
                    next();
                } else {
                    res.status(404).send({msg: 'Not Found'});
                }
            });
    },

    tempReviewAndTagExist: function (req, res, next) {
        initResolved(req);

        Promise.props({
            review: db('temp_flat_reviews').find(req.params.reviewId),
            tag   : db('review_tags').find(req.params.tagId)
        }).then(function (data) {
            if (data.review && data.tag) {
                _.extend(req.resolved, data);
                next();
            } else {
                res.status(404).send({msg: 'Not Found'});
            }
        })
    }
};