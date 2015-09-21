var app = module.exports = require('express')();
var db = appRequire('db');

app.get('/', function (req, res) {
    db('users').forPage(req.query.page).orderBy('id').all().then(function (users) {
        res.view('users/list', users);
    });
});

app.get('/:id', function (req, res) {
    db('users').find('id', req.params.id).then(function (user) {
        res.view('users/model', user);
    });
});