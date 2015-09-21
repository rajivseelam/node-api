var app = module.exports = require('express')();

var db = appRequire('db');
var view = appRequire('view').prefix('v1');

app.get('/', function (req, res) {
    db('reviewables').eagerLoad(['tags']).all().then(function (reviewables) {
        res.view('reviewables/list', reviewables);
    });
});

app.get('/map', function (req, res) {
    db('reviewables').eagerLoad(['tags']).all().then(function (reviewables) {
        res.view('reviewables/map', reviewables);
    });
});

app.get('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    id = isNaN(id) ? 0 : id;

    db('reviewables').eagerLoad(['tags']).find(id).then(function (reviewable) {
        if (reviewable) {
            res.view('reviewables/model', reviewable);
        } else {
            res.status(404).send({msg: 'Not Found'});
        }
    });
});

app.get('/slug/:slug', function (req, res) {
    db('reviewables').eagerLoad(['tags']).find('slug', req.params.slug).then(function (reviewable) {
        if (reviewable) {
            res.view('reviewables/model', reviewable);
        } else {
            res.status(404).send({msg: 'Not Found'});
        }
    });
});