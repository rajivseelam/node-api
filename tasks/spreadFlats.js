var Promise = require('bluebird');
var db = appRequire('db');

module.exports = function (gulp) {
    var args = process.argv.slice(3);
    
    if (args[0] !== '-r' || isNaN(parseFloat(args[1]))) {
        console.log('Usage => gulp spread:flats -r <radius-in-km>')
        return;
    }

    var radius = parseFloat(args[1]) * 1000;

    db.load().then(function () {
        return db('flats').all()
    }).then(function (flats) {
        return flats.reduce(function (promise, flat) {
            return promise.then(function () {
                var point = generateRandomLatLon(radius);
                flat.lat = point.lat;
                flat.lon = point.lon;

                return db('flats').save(flat);
            });
        }, Promise.resolve());
    }).then(function () {
        return db.close();
    });
};

function generateRandomLatLon(metres) {
    var origin = {
        lat: 28.5335197,
        lon: 77.21088569999999
    };

    metres = parseFloat(metres);
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