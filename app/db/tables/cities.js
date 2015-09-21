module.exports = function (db) {    
    db.Table({
        tableName       : 'cities',
        autoIncrementing: true,
        usesTimestamps  : true,

        joints: {
            joinCountries: function () {
                return this.joint(function (q) {
                    q.join('countries', 'countries.id', '=', 'cities.country_id');
                });
            }
        },

        scopes: {
            forCountry: function (country) {
                if (country) {
                    return this.where('country_id', '=', country.id);
                } else {
                    return this.scopeNull();
                }
            }
        },

        methods: {
            // add methods here
        }
    });
};