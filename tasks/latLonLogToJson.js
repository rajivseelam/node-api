var fs = require('fs');
var config = appRequire('config');

module.exports = function (gulp) {
    var latLons = fs.readFileSync(config.path('/tasks/importFlats/latLonLog'), {encoding: 'utf8'}).split('\n');

    var points = [];

    latLons.forEach(function (str) {
        if (str.trim().length > 0) {
            var parts = str.split(',');
            points.push({
                lat: parts[0],
                lon: parts[1]
            });
        }
    });

    console.log(JSON.stringify(points));
}