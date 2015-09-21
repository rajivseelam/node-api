var app = module.exports = require('express')();
var moment = require('moment');
var Promise = require('bluebird');
var _ = require('lodash');

var db = appRequire('db');

var reviewExists = appRequire('util/filters').reviewExists;


app.delete('/:reviewId/request', reviewExists, function (req, res) {

});