var passport         = require('passport');
var _                = require('lodash');
var BearerStrategy   = require('passport-http-bearer').Strategy
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy    = require('passport-local').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth2').Strategy;
var bcrypt           = require('bcryptjs');
var jwt              = require('jsonwebtoken'); // sign with default (HMAC SHA256)

/* load app modules*/
var config           = appRequire('config');
var db               = appRequire('db');
var view             = appRequire('view');

/* load file speicfics*/
var authSecretKey    = config('auth.authSecretKey');
var sessionLifetime   = config('auth.sessionLifetime');
var facebookConfig   = config('auth.facebook');
var googleConfig     = _.extend(config('auth.google'), {passReqToCallback: true});
var twitterConfig    = config('auth.twitter');

var auth = module.exports = function() {
    // Custom Stratergy to handle auth for login 
    passport.use('login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
            session: false
        },
        function(req, email, password, done) {
            // Store hash in your password DB.
            db('users').find('email', email).then(function (user) {
                if(!user) {
                    return done(null, false, { message: "User not found"});
                }
                bcrypt.compare(password, user.password, function (err, res) {
                    if (res == true) {
                        var token = jwt.sign(user.password, authSecretKey);
                        return db.cache(token, user.id, sessionLifetime)
                            .then(function(contents) {
                                user.access_token = token;
                                return done(null, user, {scope: 'all'});
                            });
                    } else {
                        return done(null, false, { message: "Invalid password"});
                    }
                });
            });
        }
    ));





    // Custom Stratergy to handle auth for register
    passport.use('register', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
            session: false
        },
        function(req, email, password, done) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    var token = jwt.sign(hash, authSecretKey);
                    // Store hash in your password DB.
                    return db('users').find("email", email).then(function(user) {
                        if (user) {
                            return done(null, null, "User already exist, Please Login");
                        } else {
                            return db('users').findOrCreate({
                                "email": email,
                                "password": hash,
                            }).then(function(user) {
                                return db.cache(token, user.id, sessionLifetime)
                                    .then(function(contents) {
                                        user.access_token = token;
                                        return done(null, user, {
                                            scope: 'all'
                                        });
                                    });
                            });
                        }
                    });
                });
            });

        }
    ));

    // Facebook Stratergy to handle social auth for web 
    passport.use(new FacebookStrategy(
        facebookConfig,
        function(accessToken, refreshToken, profile, done) {
            var token = jwt.sign(accessToken, authSecretKey);
            return db('users').findOrCreate({
                "facebook" : profile.id,
                "access_token": null,
                "profile": profile
            }).then(function(user) {
                return db.cache(token, user.id, sessionLifetime)
                    .then(function(contents) {
                        db('users').find(user.id).update({
                            first_name   : profile.displayName,
                            username     : profile._json.email,
                            email        : profile._json.email,
                            gender       : profile._json.gender,
                            imported_data: profile
                        });
                        return done(null, user, {
                            scope: 'all'
                        });
                    });
            });
        }
    ));




    // Google Oauth 2.0 Stratergy to handle for web
    passport.use('google', new GoogleStrategy(
        googleConfig,
        function(request, accessToken, refreshToken, profile, done) {
            var token = jwt.sign(accessToken, authSecretKey);
            return db('users').findOrCreate({
                    "googleplus"  : profile.id,
                    "access_token": null,
                    "profile"     : profile
            }).then(function(user) {
                return db.cache(token, user.id, sessionLifetime)
                    .then(function(contents) {
                        db('users').find(user.id).update({
                            first_name   : profile.displayName,
                            username     : profile._json.email,
                            email        : profile._json.email,
                            gender       : profile._json.gender,
                            imported_data: profile
                        });
                        return done(null, user, {
                            scope: 'all'
                        });
                    });
            });
        }
    ));

        // Twitter Stratergy to handle for web 
    passport.use('twitter', new TwitterStrategy(
        twitterConfig,
        function(token, refreshToken, profile, done) {
            var token = jwt.sign(accessToken, authSecretKey);
            return db('users').findOrCreate({
                "twitter_id": profile.id,
                "access_token": token
            }).then(function(user) {
                return db.cache(token, user.id, sessionLifetime)
                    .then(function(contents) {
                        db('users').find(user.id).update({
                            first_name: profile.displayName,
                            username: profile._json.email,
                            email: profile._json.email,
                            gender: profile._json.gender,
                            imported_data: profile
                        });
                        return done(null, user, {
                            scope: 'all'
                        });
                    });
            });

        }
    ));


    //token bearer auth setup
    passport.use(
        new BearerStrategy(
            function(token, done) {
                db.cache(token).
                then(function(userId) {
                    db('users').find('id', userId).
                    then(function(user) {
                        return done(null, user, {
                            scope: 'all'
                        })
                    });
                });
            }
        )
    );

};