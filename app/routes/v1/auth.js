var app               = module.exports = require('express')();
var passport          = require('passport');
var Promise           = require("bluebird");
var request           = require('request-promise');
var qs                = require('querystring');
var jwt               = require('jsonwebtoken'); // sign with default (HMAC SHA256)
var _                 = require('lodash');

var db                = appRequire('db');
var config            = appRequire('config');
var userAlreadyExists = appRequire('util/filters').userAlreadyExists;

var authSecretKey     = config('auth.authSecretKey');
var sessionLifetime   = config('auth.sessionLifetime');
var fbScopes          = config('auth.facebook.scopes');


app.get(
    '/me',
    function (req, res) {
        res.send('<a href="/facebook">Log in FB</a>');
    }
);

app.get(
    '/check',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        res.send({msg: 'Logged In'});
    }
);

app.get(
    '/profile',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        Promise.props({
            flat_reviews: db('flat_reviews').where('user_id', req.user.id).count(),
            temp_reviews: db('temp_flat_reviews').where('user_id', req.user.id).count()
        }).then(function (counts) {
            var total = counts.flat_reviews + counts.temp_reviews;
            res.view('users/model', req.user, total);
        });
    }
);

app.put(
    '/profile',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        if (req.body.data && req.body.data.about) {
            req.user.about = req.body.data.about;
            db('users').save(req.user).then(function () {
                res.send({
                    msg: 'User updated',
                    data: res.serialize('users/model', req.user)
                });
            });
        } else {
            res.send({
                msg: 'No Change',
                data: res.serialize('users/model', req.user)
            })
        }
    }
)

app.get(
    '/profile/reviews',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        Promise.props({
            reviewables : db('reviewables').eagerLoad(['tags']).all(),
            flat_reviews: db('flat_reviews').eagerLoad(['flat', 'tags.reviewable'])
                .where('user_id', req.user.id).orderBy('id', 'desc').all(),
            temp_reviews: db('temp_flat_reviews').eagerLoad(['tags.reviewable'])
                .where('user_id', req.user.id).orderBy('id', 'desc').all()
        }).then(function (data) {
            res.send({
                reviews: res.serialize('reviews/list', data.flat_reviews, null, data.reviewables, 'list').data,
                tempReviews: res.serialize('tempReviews/list', data.temp_reviews).data
            })
        });
    }
);

app.get(
    '/profile/reviews.count',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        Promise.props({
            flat_reviews: db('flat_reviews').where('user_id', req.user.id).count(),
            temp_reviews: db('temp_flat_reviews').where('user_id', req.user.id).count()
        }).then(function (counts) {
            res.send({
                reviews: counts.flat_reviews,
                tempReviews: counts.temp_reviews
            });
        });
    }
);

app.get(
    '/profile/reviews-count',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        Promise.props({
            flat_reviews: db('flat_reviews').where('user_id', req.user.id).count(),
            temp_reviews: db('temp_flat_reviews').where('user_id', req.user.id).count()
        }).then(function (data) {
            res.send({msg: (data.flat_reviews+data.temp_reviews)});
        });
    }
);

app.post('/login',
    passport.authenticate('login', {
        session: false
    }),
    function (req, res) {
        res.view('users/model', req.user);
    });

app.post('/register',
    userAlreadyExists,
    passport.authenticate('register', {
        session: false
    }),
    function (req, res) {
        res.view('users/model', req.user);
    });

/**
 * oAuth Flow for facebook login
 * 
 * @param  { social_id: "123123", access_toke: "<oAuth token from oAuth provider>"
 * returns user object with access token
 */
app.post(
    '/social/facebook',
    function (req, res) {
        var base = 'https://graph.facebook.com/v2.4/';
        var uri = base + 'me' + '?' + qs.stringify({
            access_token: req.body.access_token,
            fields: fbScopes.join(',')
        });
        var pictureUri = base + req.body.social_id +'/picture?type=large';
        request(uri, {
            json: true
        }).then(function (fbRes) {
            var token = jwt.sign(req.body.access_token, authSecretKey);
            var options = fbRes;
            if (options.id === req.body.social_id) {
                _.extend(options, {picture: pictureUri});
                return db("users").findOrCreate({
                        "facebook": options.id,
                        "access_token": null,
                        "profile": options
                    })
                    .then(function(user) {
                        return db.cache(token, user.id, sessionLifetime)
                            .then(function(contents) {
                                user.access_token = token;
                                return res.view('users/model', user);
                            });
                    });
            } else {
                return res.status(400).send({
                    "message": "Invalid credintials"
                });
            }
        }).catch(function (fbRes) {
            return res.status(fbRes.statusCode).send(fbRes.response.body);
        });
    }
);

/**
 * Redirect the user to Facebook for authentication.  When complete,
 * Facebook will redirect the user back to the application
 * at /auth/facebook/callback
 */
app.get(
    '/facebook',
    passport.authenticate('facebook', {
        session: false,
        scope: []
    })
);

/**
 * Facebook will redirect the user to this URL after approval.
 * Finish the authentication process by attempting to obtain an access token.
 * If access was granted, the user will be logged in.
 * Otherwise, authentication has failed.
 */
app.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: "/"
    }),
    function (req, res) {
        res.send(req.user);
    }
);


/**
 * oAuth Flow for google plus
 * 
 * @param  { social_id: "123123", access_toke: "<oAuth token from oAuth provider>"
 * returns user object with access token
 */
app.post(
    '/social/google',
    function (req, res) {
        var uri = 'https://www.googleapis.com/oauth2/v2/userinfo' + '?' + qs.stringify({
            access_token: req.body.access_token
        });
        request(uri, {
            json: true
        }).then(function(googleRes) {
            var token = jwt.sign(req.body.access_token, authSecretKey);
            var options = googleRes;
            if (options.id === req.body.social_id) {
                return db("users").findOrCreate({
                        "google": options.id,
                        "access_token": null,
                        "profile": options
                    })
                    .then(function (user) {
                        return db.cache(token, user.id, sessionLifetime)
                            .then(function(contents) {
                                user.access_token = token;
                                return res.view('users/model', user);
                            });
                    });
            } else {
                return res.status(400).send({
                    "message": "Invalid credintials"
                });
            }
        }, function (googleRes) {
            return res.status(googleRes.statusCode).send(googleRes.response.body);
        });
    }
);
/**
 * Redirect the user to Google for authentication.
 * When complete, Google will redirect the user back to the application
 * at /auth/google/return
 */
app.get(
    '/google',
    passport.authenticate('google', {
        session: false,
        scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
    })
);


/**
 * Google will redirect the user to this URL after authentication.
 * Finish the process by verifying the assertion.
 * If valid, the user will be logged in.  Otherwise, authentication has failed.
 */
app.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: "/"
    }),
    function (req, res) {
        res.send(req.user);
    }
);



/**
 * Redirect the user to Twitter for authentication.
 * When complete, Twitter will redirect the user back to the application
 * at /auth/twitter/callback
 */
app.get('/twitter', passport.authenticate('twitter', {
    session: false
}));

/**
 * Twitter will redirect the user to this URL after approval.  Finish the
 * authentication process by attempting to obtain an access token.
 * If access was granted, the user will be logged in.
 * Otherwise,authentication has failed.
 */
app.get('/twitter/callback',
    passport.authenticate('twitter', { // handle success and failure events here
        session: false,
        failureRedirect: '/auth/me'
    }),
    function (req, res) {
        res.send(req.user);
    }
);