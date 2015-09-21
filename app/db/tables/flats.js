var _ = require('lodash');

module.exports = function (db) {
    db.Table({
        tableName       : 'flats',
        autoIncrementing: true,
        usesTimestamps  : true,

        relations: {
            reviews: function () {
                return this.hasMany('flat_reviews', 'flat_id');
            }
        },

        joints: {
            leftJoinFlatReviews: function () {
                return this.joint(function (q) {
                    q.leftJoin(
                        'flat_reviews',
                        'flat_reviews.flat_id', '=', 'flats.id'
                    );
                });
            },

            leftJoinReviewTagsPivot: function () {
                return this.leftJoinFlatReviews().joint(function (q) {
                    q.leftJoin(
                        'flat_review_tag',
                        'flat_review_tag.review_id', '=', 'flat_reviews.id'
                    )
                });
            },

            leftJointReviewTags: function () {
                return this.leftJoinReviewTagsPivot().joint(function (q) {
                    q.leftJoin(
                        'review_tags',
                        'review_tags.id', '=', 'flat_review_tag.tag_id'
                    );
                });
            },

            leftJoinReviewables: function () {
                return this.leftJointReviewTags().joint(function (q) {
                    q.leftJoin(
                        'reviewables',
                        'reviewables.id', '=', 'review_tags.reviewable_id'
                    );
                });
            },

            joinReviews: function () {
                return this.joint(function (q) {
                    q.join(
                        'flat_reviews',
                        'flat_reviews.flat_id', '=', 'flats.id'
                    );
                });
            },

            joinReviewTagsPivot: function () {
                return this.joinReviews().joint(function (q) {
                    q.join(
                        'flat_review_tag',
                        'flat_review_tag.review_id', '=', 'flat_reviews.id'
                    )
                });
            }
        },

        scopes: {
            scopeAround: function (lat, lon, metres) {
                metres = metres || 5000
                return this.select([
                    '*',
                    db.raw(
                        'earth_distance(ll_to_earth(?, ?), ll_to_earth(flats.lat, flats.lon)) as "distance"',
                        [lat, lon]
                    )
                ]).whereRaw(
                    'earth_box(ll_to_earth(?, ?), ?) @> ll_to_earth(flats.lat, flats.lon) and \
                     earth_distance(ll_to_earth(?, ?), ll_to_earth(flats.lat, flats.lon)) < ?',
                    [lat, lon, metres, lat, lon, metres]
                ).orderBy('distance');
            }
        },

        methods: {

        }
    })
};