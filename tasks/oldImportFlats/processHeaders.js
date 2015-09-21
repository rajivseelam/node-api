var Promise = require('bluebird');
var _       = require('lodash');
var db      = appRequire('db');

module.exports = processHeaders;

function processHeaders(headers, staticFields, dynamicFields, fieldsArray, rowNum) {
    headers.forEach(function (col) {
        var field = col.split(':')[0].trim();
        var val = col.split(':')[1].trim();

        if (_.keys(staticFields).indexOf(field) === -1) {
            dynamicFields[field] = val;
        } else {
            staticFields[field] = val;
        }

        fieldsArray.push(field);
    });

    console.log(_.keys(staticFields))
    console.log(_.keys(dynamicFields));

    return db.load().then(function () {
        return processDynamicFields(dynamicFields);
    }).then(function () {
        return db.close();
    });
};

function processDynamicFields(dynamicFields) {
    var reviewables = [];

    _.forEach(dynamicFields, function (val, field) {
        reviewables.push({
            title      : unSlug(field),
            slug       : field,
            description: val
        });
    });

    return Promise.all(reviewables.map(function (r) {
        return db('reviewables').find('slug', r.slug).then(function (model) {
            if (model) {
                r.id = model.id;
            }

            return db('reviewables').save(r);
        });
    }));
};

function unSlug(str, separator) {
    separator = separator || '_';
    return str.split(separator).map(function (s) {
        return s[0].toUpperCase()+s.slice(1);
    }).join(' ');
};