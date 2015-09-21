module.exports = function (db) {
    db.Table({
        tableName       : 'countries',
        autoIncrementing: true,
        usesTimestamps  : true,

        joints: {
            // add joints here
        },

        scopes: {
            // add scopes here
        },

        methods: {
            // add methods here
        }
    });
};