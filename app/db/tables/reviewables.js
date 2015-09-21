var _ = require('lodash');

module.exports = function (db) {
    db.Table({
        tableName       : 'reviewables',
        autoIncrementing: true,
        usesTimestamps  : true,

        rowParser: function (row) {
            return _.transform(row, function (o, v, k) {
                if (k === 'weight') {
                    v = parseFloat(v || 0);
                }

                o[k] = v;
            });
        },

        relations: {
            tags: function () {
                return this.hasMany('review_tags', 'reviewable_id');
            }
        },

        joints: {

        },

        scopes: {

        },

        methods: {

        }
    })
};