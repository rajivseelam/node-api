var _ = require('lodash');

module.exports = function (db) {
    db.Table({
        tableName       : 'review_tags',
        autoIncrementing: true,
        usesTimestamps  : true,

        rowParser: function (row) {
            return _.transform(row, function (o, v, k) {
                if (k === 'score') {
                    v = parseFloat(v || 0);
                }

                o[k] = v;
            });
        },

        relations: {
            reviewable: function () {
                return this.belongsTo('reviewables', 'reviewable_id');
            }
        },

        joints: {
            joinFlatReviewTag: function () {
                return this.joint(function (q) {
                    q.join(
                        'flat_review_tag',
                        'flat_review_tag.tag_id', '=', 'review_tags.id'
                    );
                });
            },

            joinTempFlatReviewTag: function () {
                return this.joint(function (q) {
                    q.join(
                        'temp_flat_review_tag',
                        'temp_flat_review_tag.tag_id', '=', 'review_tags.id'
                    );
                });
            }
        },

        scopes: {

        },

        methods: {
            
        }
    })
};