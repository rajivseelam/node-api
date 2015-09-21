var path = function(path) {
    return require('path').normalize(__dirname + '/../..' + path);
};
var package = require(path('/package.json'));

module.exports = {
    path: path,

    name: package.name,

    api: {
        defaultVersion: 'v1',
        versions: ['v1']
    },

    server: {
        port: 3030,
        uploadsDir: path('/storage/uploads'),
        publicDir: path('/public')
    },

    redis: {
        development: {
            host         : 'localhost',
            port         : '6379',
            dbCachePrefix: '_div.cache'
        },
        production: {
            host         : 'localhost',
            port         : '6379',
            dbCachePrefix: '_div.cache'
        }
    },

    db: {
        development: {
            client: 'postgresql',
            connection: {
                database: 'flatabout_dev',
                host    : "localhost",
                port    : 5432,
                user    : 'dev',
                password: 'dev'
            },
            pool: {
                min: 2,
                max: 10
            },
            migrations: 'knex_migrations'
        },

        staging: {
            client: 'postgresql',
            connection: {
                database: 'flatabout_staging',
                host    : 'fltabtrdsinstance.ccmnxeg7mjny.us-west-2.rds.amazonaws.com',
                port    : 5432,
                user    : 'fltabt',
                password: 'flataboutstaging'
            },
            pool: {
                min: 2,
                max: 10
            },
            migrations: {
                tableName: 'knex_migrations'
            }
        },

        production: {
            client: 'postgresql',
            connection: {
                database: 'flatabout_staging',
                host    : "prod-db.c9uhrbyhdeah.ap-southeast-1.rds.amazonaws.com",
                port    : 5432,
                user    : 'fltabt',
                password: 'flataboutstaging'
            },
            pool: {
                min: 2,
                max: 10
            },
            migrations: {
                tableName: 'knex_migrations'
            }
        }
    },
    auth: {
        development: {

            authSecretKey: '5UP31253CU123', // replace with rsa_key.cert or etcs for signing secure tokens

            sessionLifetime: 500 * 24 * 3600 * 1000,

            facebook : {
                clientID    : '859258640764878',
                clientSecret: '6f567614a4ad4aac2e33b58cb415cbeb',
                callbackURL : 'http://localhost:3030/auth/facebook/callback',
                scopes      : ['picture','about','email','bio','birthday','address','devices','education','first_name','gender','hometown','id','age_range','context']     
            },

            google : {
                clientID    : '861005991790-doke7jotn1i13e27pnlt0h2l261gnhec.apps.googleusercontent.com',
                clientSecret: 'KFx93M5hBCUhlqZBqxQ3p2B1',
                callbackURL : 'http://localhost:8080/auth/google/callback'
            },

            twitter : {
                consumerKey   : 'your-consumer-key-here',
                consumerSecret: 'your-client-secret-here',
                callbackURL   : 'http://localhost:8080/auth/twitter/callback'   
            }

        },
        staging: {

            authSecretKey: '5UP31253CU123', // replace with rsa_key.cert or etcs for signing secure tokens

            sessionLifetime: 500 * 24 * 3600 * 1000,

            facebook : {
                clientID    : '990765300947544',
                clientSecret: 'c8714cbeba1dd8a1155e290dff529877',
                callbackURL : 'http://ec2-52-26-213-120.us-west-2.compute.amazonaws.com/auth/facebook/callback',
                scopes      : ['picture','about','email','bio','birthday','address','devices','education','first_name','gender','hometown','id','age_range','context']
            },

            twitter : {
                consumerKey   : 'your-consumer-key-here',
                consumerSecret: 'your-client-secret-here',
                callbackURL   : 'http://localhost:8080/auth/twitter/callback'
            },

            google : {
                clientID    : '861005991790-s31dbrvac154ehh0nsf71efqhuk1rdrm.apps.googleusercontent.com',
                clientSecret: 'mdz29IyH7P0-UJVZc6wgIRNf',
                callbackURL : 'http://ec2-52-26-213-120.us-west-2.compute.amazonaws.com/auth/google/callback',
            }

        },
        production: {

            authSecretKey: '5UP31253CU123', // replace with rsa_key.cert or etcs for signing secure tokens

            sessionLifetime: 500 * 24 * 3600 * 1000,

            facebook : {
                clientID      : 'your-secret-clientID-here', // your App ID
                clientSecret  : 'your-client-secret-here', // your App Secret
                callbackURL   : 'http://localhost:8080/auth/facebook/callback',
                scopes        : ['picture','about','email','bio','birthday','address','devices','education','first_name','gender','hometown','id','age_range','context']
            },

            twitter : {
                consumerKey   : 'your-consumer-key-here',
                consumerSecret: 'your-client-secret-here',
                callbackURL   : 'http://localhost:8080/auth/twitter/callback'
            },

            google : {
                clientID      : 'your-secret-clientID-here',
                clientSecret  : 'your-client-secret-here',
                callbackURL   : 'http://localhost:8080/auth/google/callback'
            }

        },

    }
};