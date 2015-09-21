var _       = require('lodash');
var Promise = require('bluebird');

module.exports = function (db) {
    db.Table({
        tableName       : 'flat_reviews',
        autoIncrementing: true,
        usesTimestamps  : true,

        relations: {
            tags: function () {
                return this.belongsToMany(
                    'review_tags', 'flat_review_tag', 'review_id', 'tag_id'
                );
            },

            user: function () {
                return this.belongsTo('users', 'user_id');
            },

            flat: function () {
                return this.belongsTo('flats', 'flat_id');
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