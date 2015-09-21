var csv     = require('csv');
var fs      = require('fs');
var Promise = require('bluebird');
var md5     = require('MD5');
var moment  = require('moment');
var db      = appRequire('db');
var config  = appRequire('config');

var processHeaders = require('./processHeaders');
var processRow     = require('./processRow');

module.exports = function (gulp) {
    var header = true;
    var rowNum = 0;

    var staticFields = {
        review_date   : null,
        residency_type: null,
        name          : null,
        email         : null,
        phone_number  : null,
        address       : null,
        remarks       : null,
        refree_name   : null
    };

    var dynamicFields = {};

    var fieldsArray = [];

    var start = new Date;    

    var stream = fs.createReadStream(__dirname+'/scores.csv');
    var parser = csv.parse();
    var processor = csv.transform(function (row) {
        if (header) {
            parser.pause();
            header = false;
            processHeaders(row, fieldsArray, rowNum)
                .then(function () {
                    rowNum++;
                    parser.resume();
                });
        } else {
            parser.pause();
            processRow(row, fieldsArray, rowNum)
                .then(function () {
                    console.log(rowNum + ' : ' + ((new Date) - start));
                    rowNum++;
                    parser.resume();
                });           
        }
    });

    stream.pipe(parser).pipe(processor);
};