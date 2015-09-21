var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');

var db = appRequire('db');
var filters = appRequire('util/filters');

function generateRandomLatLon(origin, metres) {
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

app.get('/', function (req, res) {
    var q = db('flats').joinReviewTagsPivot();

    if (req.query.lat && req.query.lon && req.query.radius) {
        var geo = {
            lat   : parseFloat(req.query.lat),
            lon   : parseFloat(req.query.lon),
            radius: parseInt(req.query.radius)
        };

        q.scopeAround(geo.lat, geo.lon, geo.radius);
    }

    if (req.query.ids) {
        var ids = _.isArray(req.query.ids) ? req.query.ids : req.query.ids.split(',');

        q.whereIn('id', ids);
    }

    q.eagerLoad([
        'reviews.tags.reviewable',
        'reviews.user'
    ]).all().then(function (flats) {
        res.view('flats/list', flats, req.query.includes);
    });
});

app.get('/dummies', function (req, res) {
    var flats = appRequire('config/fake-flats').data.map(function (f) {
        return _.omit(f, ['reviews']);
    });

    if (req.query.lat && req.query.lon && req.query.radius) {
        var geo = {
            lat   : parseFloat(req.query.lat),
            lon   : parseFloat(req.query.lon),
            radius: parseInt(req.query.radius)
        };

        flats.forEach(function (f) {
            var point = generateRandomLatLon({lat: geo.lat, lon: geo.lon}, 1000);

            f.lat = point.lat.toString();
            f.lon = point.lon.toString();
        });
    }
    res.send({data: flats});
});

app.get('/dummies/:id/reviews', function (req, res) {
    var dummy = appRequire('config/fake-flats').data.filter(function (f) {
        return f.id == req.params.id;
    })[0];

    if (dummy) {
        var data  = _.pick(dummy, 'reviews');
        var flat  = _.omit(dummy,['reviews']);
        res.send({
            data: data.reviews,
            flat: flat
        });
    } else {
        res.status(404).send({msg: 'Not Found'});
    }
});

app.get('/:id', function (req, res) {
    db('flats').where('id', req.params.id)
        .eagerLoad(['reviews.tags.reviewable'])
        .first().then(function(flat) {
            if (flat) {
                res.view('flats/model', flat);
            } else {
                res.status(404).send({
                    msg: 'not found'
                });
            }
        });
});

app.get('/:flatId/reviews', filters.flatExists, function(req, res) {
    var format = ['dict', 'list'].indexOf(req.query.format) > -1 ? req.query.format : 'dict';

    Promise.props({
        reviewables: (
            db('reviewables').eagerLoad(['tags']).all()
        ),
        reviews: (
            db('flat_reviews').where('flat_id', req.resolved.flat.id)
                .eagerLoad(['user', 'tags.reviewable'])
                .forPage(req.query.page, req.query.per_page)
                .all()
        )
    }).then(function (data) {
        res.view(
            'reviews/list', data.reviews, req.resolved.flat,
            data.reviewables, req.query.format
        );
    });
});