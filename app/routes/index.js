var app = module.exports = require('express')();
var _ = require('lodash');
var passport = require('passport');
var cors = require('cors');

var db = appRequire('db');
var config = appRequire('config');

// load auth
appRequire('auth')();

var authFilter = passport.authenticate('bearer', {
    session: false
});

// setup cors
app.use(cors());

// load up request pagination params
app.use(function (req, res, next) {
    var page = req.query.page;
    var perPage = req.query.per_page;
    var includes = req.query.includes;

    page = isNaN(page) ? 1 : Math.abs(parseInt(page));
    
    perPage = isNaN(perPage) ? 100 : Math.abs(parseInt(perPage));
    perPage = perPage < 100 ? perPage : 100;

    if (_.isArray(includes)) {
        includes = includes;
    } else if (_.isString(includes)) {
        includes = includes.split(',');
    } else {
        includes = []
    }

    req.query.page = page;
    req.query.per_page = perPage;
    req.query.includes = includes;

    next();
});


// load up routes according to api version
var versionedApps = (function () {
    var apps = {};

    config('api.versions').forEach(function (v) {
        apps[v] = require('./'+v);
    });

    return apps;
}());

app.use(function (req, res, next) {
    var apiVersion = req.header('accept-version');
    
    if (config('api.versions').indexOf(apiVersion) === -1) {
        apiVersion = config('api.defaultVersion');
    }

    versionedApps[apiVersion](req, res, next);
});

// Some "tashan"
app.get('/', function (req, res) {
    res.send({'msg': 'I am Javascript'});
});

// Global Not Found route
app.all('*', function (req, res) {
    res.send({'msg': 'Not Found'});
});