var _ = require('lodash');

module.exports = function (view, user, reviewsCount) {
    var o = {
        data: _.omit(user, [
            'plain_password',
            'password',
            'facebook_id',
            'twitter_id',
            'github_id',
            'googleplus_id'
        ])
    };

    if (reviewsCount !== undefined) {
        o.reviews_count = reviewsCount;
    }

    if (user.imported_data && user.imported_data.picture) {
        o.data.picture = user.imported_data.picture;
    } else {
        o.data.picture = null;
    }

    return o;
};