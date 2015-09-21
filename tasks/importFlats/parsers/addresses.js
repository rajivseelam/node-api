var Promise = require('bluebird');
var _ = require('lodash');
var db = appRequire('db');

var titleFieldMap = {
    'Email'       : 'email',
    'Mobile'      : 'mobile',
    'Flat No.'    : 'flat_number',
    'Sub Locality': 'sub_locality',
    'Locality'    : 'locality',
    'Pincode'     : 'pincode',
    'city'        : 'city',
    'state'       : 'state'
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
    var models = {
        user: {},
        address: {}
    };

    row.forEach(function (col, i) {
        var field = colFieldMap[i];

        if (field === 'email') {
            models.user.email = col.trim();
        }

        if (field === 'mobile') {
            models.user.mobile = col.trim();
        }

        if (field === 'flat_number') {
            models.address.flat_number = col.trim();
        }

        if (field === 'sub_locality') {
            models.address.locality = col.trim();
        }

        if (field === 'locality') {
            models.address.locality = [models.address.locality, col.trim()].filter(function (l) {
                return l.length > 0;
            }).join(', ');
        }

        if (field === 'pincode') {
            models.address.pincode = col.trim();
        }

        if (field === 'city') {
            models.address.city = col.trim();
        }

        if (field === 'state') {
            models.address.state = col.trim();
        }
    });

    return db('users').eagerLoad(['reviews', 'reviews.flat'])
        .find('email', models.user.email).then(function (user) {
            var flat = user.reviews[0].flat;
            _.extend(flat.address, models.address);
            return db('flats').save(flat);
        });

    return Promise.resolve();
}