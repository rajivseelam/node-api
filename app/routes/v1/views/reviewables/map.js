var _ = require('lodash');

module.exports = function (view, reviewables) {
    return {
        data: _.reduce(reviewables, function (result, reviewable) {
            if (! _.isArray(result[reviewable.slug])) {
                result[reviewable.slug] = [];
            }

            if (_.isArray(reviewable.tags)) {
                reviewable.tags.forEach(function (t) {
                    result[reviewable.slug].push(t);
                });
            }

            return result;
        }, {})
    };
};