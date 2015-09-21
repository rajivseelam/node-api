var db = appRequire('db');

module.exports = function (gulp) {
    db.load().then(function () {
        return fixLatLons();
    }).then(function (rows) {
        return db.close();
    });
}

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
        lat: parseFloat(origin.lat) + y1,
        lon: parseFloat(origin.lon) + x1
    };
};

function fixLatLons() {
    return db.knex('flats').select(['lat', 'lon', db.raw('count(id) as count')])
        .groupBy('lat', 'lon').havingRaw('count(id) > 1')
        .then(function (rows) {
            if (rows.length === 0) {
                return;
            }

            return Promise.all(rows.map(function (row) {
                return db('flats').where({lat: row.lat, lon: row.lon}).first()
                    .then(function (flat) {
                        var point = generateRandomLatLon({lat: row.lat, lon: row.lon}, 200);
                        flat.lat = point.lat;
                        flat.lon = point.lon;
                        return db('flats').save(flat);
                    });
            })).then(function (flats) {
                return fixLatLons();
            });
        });
}