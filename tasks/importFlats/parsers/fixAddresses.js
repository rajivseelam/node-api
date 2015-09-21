var Promise = require('bluebird');
var _ = require('lodash');
var db = appRequire('db');

var titleFieldMap = {
    'Ref no.': 'id',
    'Address': 'address',
    'Lat long': 'point'
};

var colFieldMap = {};

module.exports = function (row, rowNum) {
    if (rowNum === 0) {
        return parseHeader(row, rowNum);
    } else {
        return parseRow(row, rowNum);
    }
};

function parseHeader(row, rowNum) {
    row.forEach(function (col, index) {
        var field = titleFieldMap[col];
        colFieldMap[index] = field;
    });

    return Promise.resolve();
}

function parseRow(row, rowNum) {
    var model = {
        id: null,
        address: null,
        point: {}
    };

    row.forEach(function (col, i) {
        var field = colFieldMap[i];

        if (field === 'id') {
            model[field] = col.trim();
        }

        if (field === 'address') {
            model[field] = col.trim();
        }

        if (field === 'point') {
            if (col.trim().length === 0) {
                model.point = generateRandomLatLon(10000);
            } else {
                var points = col.trim().split(',');
                model.point.lat = points[0];
                model.point.lon = points[1];
            }
        }
    });

    return db('flats').find(model.id).then(function (flat) {
        if (! flat) {
            return;
        }

        flat.lat = model.point.lat;
        flat.lon = model.point.lon;
        return db('flats').save(flat);
    });
}

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