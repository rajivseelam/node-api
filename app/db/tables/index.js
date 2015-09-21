module.exports = function (db) {
    // load up all table definitions here
    require('./users')(db);
    require('./countries')(db);
    require('./cities')(db);
    require('./localities')(db);
    require('./flats')(db);
    require('./flatReviews')(db);
    require('./flatReviewTag')(db);
    require('./reviewTags')(db);
    require('./reviewables')(db);
    require('./tempFlatReviews')(db);
    require('./tempFlatReviewTag')(db);
};