require('./appRequire')();

var gulp = module.exports = require('gulp');
var _ = require('lodash');

var db = appRequire('db');

db.loadTables = function () {
    appRequire('db/tables')(db);
};

var tasks = require('./tasks');

_.forEach(tasks, function (task, name) {
    gulp.task(name, function () {
        task(gulp);
    });
});

gulp.task('default', function () {
    _.forEach(tasks, function (task, name) {
        console.log(name);
    });
});