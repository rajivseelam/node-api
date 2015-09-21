module.exports = function (db) {
    db.Table({
        tableName       : 'temp_flat_reviews',
        autoIncrementing: true,
        usesTimestamps  : true,

        relations: {
            tags: function () {
                return this.belongsToMany(
                    'review_tags', 'temp_flat_review_tag', 'review_id', 'tag_id'
                );
            },

            user: function () {
                return this.belongsTo('users', 'user_id');
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