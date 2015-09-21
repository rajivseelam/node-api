var _ = require('lodash');
module.exports = function(db) {
    db.Table({
        tableName       : 'users',
        autoIncrementing: true,
        usesTimestamps  : true,

        joints          : {

        },

        scopes          : {

        },

        relations: {
            reviews: function () {
                return this.hasMany('flat_reviews', 'user_id');
            }
        },

        methods         : {
            // add methods here
            findOrCreate: function(params) {
                var prop = params;
                var args = Object.keys(params);
                return this.find("social_accounts->>'" + args[0] + "'",
                    params[args[0]]).then(function(user) {
                        if (user) {
                            var data = {};
                            var propData = {};
                            if(prop.profile.email){
                                 propData[args[0]] = params[args[0]];
                                 data = {
                                    social_accounts: propData,
                                    imported_data  : params[args[2]],
                                    full_name      : prop.profile.first_name,
                                    email          : prop.profile.email,
                                    username       : prop.profile.email
                                };
                                if(prop.profile.first_name) {
                                    data.full_name = prop.profile.first_name;  
                                 }
                                 else {
                                    data.full_name = prop.profile.name;
                                 }
                                _.extend(user, data);
                                return this.save(user);
                            }
                            return user;
                        } else {
                        var metaData = params[args[2]];
                        var propData = {};
                        var data = {};
                        if(prop.profile){
                             propData[args[0]] = params[args[0]];
                             data = {
                                social_accounts: propData,
                                imported_data  : params[args[2]],
                                full_name      : prop.profile.first_name,
                                email          : prop.profile.email,
                                username       : prop.profile.email
                            };
                            if(prop.profile.first_name) {
                                data.full_name = prop.profile.first_name;  
                            }
                            else {
                                data.full_name = prop.profile.name;
                            }
                        }
                        else {
                            data = params;
                        }
                        return this.save(data);
                    }
                }.bind(this));
            }
        }
    });
};