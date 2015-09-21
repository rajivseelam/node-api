var app = module.exports = require('express')();
var view = appRequire('view').root(__dirname+'/views');

app.use(function (req, res, next) {
    res.view = function (args) {
        args = Array.prototype.slice.call(arguments, 0);
        res.send(res.serialize.apply(res, args));
    };

    res.serialize = function (args) {
        args = Array.prototype.slice.call(arguments, 0);
        var name = args[0];
        args = args.slice(1);

        return view(name).apply({}, args);
    };    

    next();
});

// set up app template handling
app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

// load up the routes
app.use('/reviewables', require('./reviewables'));
app.use('/users', require('./users'));
app.use('/flats', require('./flats'));
app.use('/reviews', require('./reviews'));
app.use('/temp-reviews', require('./tempReviews'));
app.use('/auth', require('./auth'));

// load up the review-form route
app.get('/review-views', function (req, res) {
    res.send({
        data: appRequire('config/review-views')
    });
});

var db = appRequire('db');

app.get('/review-form', function (req, res) {
    db('reviewables').eagerLoad(['tags'])
        .all().then(function (reviewables) {
            res.render('templates/reviewForm', {
                reviewables: reviewables,
                reviewViews: appRequire('config/review-views')
            });
        });
});

app.get('/amdin-dashboard', function (req, res) {
    res.redirect('/admin/dev.html');
});

app.get('/new-review-form', function (req, res) {
    res.redirect('/reviewForm/dev.html');
});