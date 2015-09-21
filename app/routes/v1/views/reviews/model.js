var _ = require('lodash');

module.exports = function (view, review, reviewables, format) {
    format = ['dict', 'list'].indexOf(format) > -1 ? format : 'dict';

    if (_.isArray(review.tags) && _.isArray(reviewables)) {
        // we have all the tags of the review attached with us, along
        // with their reviewables
        var tags = review.tags;
        var allowedReviewable = reviewables.filter(function (r) {
            return r.slug === 'allowed';
        })[0];

        if (format === 'dict') {
            review.tags = {};
            reviewables.forEach(function (r) {
                review.tags[r.slug] = [];
            });

            // then we attach the data of tags
            tags.forEach(function (t) {
                t.value = t.title;
                review.tags[t.reviewable.slug].push(_.omit(t, ['reviewable']));
            });

            // then we tackle the case of not-allowed tags
            if (allowedReviewable) {
                var allowedIds = _.pluck(review.tags['allowed'], 'id');
                review.tags['not-allowed'] = allowedReviewable.tags.filter(function (t) {
                    return allowedIds.indexOf(t.id) === -1;
                });

                review.tags['not-allowed'].forEach(function (t) {
                    t.value = t.title;
                });
            }
        } else {
            review.tags.forEach(function (t) {
                t.reviewable = reviewables.filter(function (r) {
                    return t.reviewable_id === r.id;
                }).map(function (r) {
                    return {
                        title: r.title,
                        slug: r.slug
                    };
                })[0];
            });

            if (allowedReviewable) {
                allowedReviewable.tags.filter(function (t) {
                    return review.tags.map(function (t) {
                        return t.id;
                    }).indexOf(t.id) === -1;
                }).forEach(function (tag) {
                    tag.reviewable = {
                        title: 'Not Allowed',
                        slug: 'not-allowed'
                    };

                    review.tags.push(tag);
                });
            }

            review.tags.forEach(function (t) {
                t.value = t.title;
            })
        }
    }

    if (_.isObject(review.user)) {
        review.user = view('users/model')(review.user);
    }

    return {data: review};
};