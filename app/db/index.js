var Promise = require('bluebird');
var _ = require('lodash');

var config = appRequire('config');
var Table = require('./Table');

module.exports = db;

function db(table, transaction) {    
    var table = db.tables[table].fork();
    
    if (arguments.length === 2) {
        table.transacting(transaction);
    }

    return table;
};

// replace this method in your main script;
// it should load up all the tables
db.loadTables = function (db) {
    throw 'override loadTables, and load tables in it';
};

// this method needs to be called once
// in the beginning of your app

db.load = function () {

    // add in the tables functionality
    db.tables = {};

    db.Table = function (opts) {
        db.tables[opts.tableName] = Table(db, opts);
        return db;
    };

    db.extend = function (tableName, extender) {
        extender(db(tableName));
        return db;
    };

    // setup knex
    db.knex = require('knex')(config('db'));

    // raw helper
    db.raw = db.knex.raw;

    // a transaction helper
    db.transaction = db.knex.transaction;

    // a transaction wrapper
    // usage:
    // return db.trx(function (t) {
    //   return db('users', t).save([{}, {}, {}]);
    // });
    db.trx = function (promiseFn) {
        var outerResult;
        
        return db.transaction(function (t) {
            return promiseFn(t).then(function (result) {
                return t.commit().then(function () {
                    outerResult = result;
                    return result;
                });
            }).catch(function (e) {
                t.rollback();
                throw e;
            });
        }).then(function () {
            return outerResult;
        });
    };

    // redis settings
    db.redis = new require('ioredis')(config('redis'));

    db.redis.defineCommand('cleanup', {
        numberOfKeys: 0,
        lua: '\
            local keys = redis.call("keys", ARGV[1]) \n\
            for i=1,#keys,5000 do \n\
                redis.call("del", unpack(keys, i, math.min(i+4999, #keys))) \n\
            end \n\
            return keys'
    });

    // redis based cache helper
    db.cache = function (args) {
        args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 0) {
            return db.redis;
        }

        if (args.length === 1) {
            return db.cache.get(args[0]);
        }

        if (args.length === 2) {
            return db.cache.set(args[0], args[1]);
        }

        if (args.length === 3) {
            return db.cache.set(args[0], args[1], args[2]);
        }
    };

    db.cache.set = function (key, val, lifetime) {
        if (_.isNumber(lifetime)) {
            return db.redis.psetex(key, lifetime, JSON.stringify(val));
        } else {
            return db.redis.set(key, JSON.stringify(val));
        }
    };

    db.cache.get = function (key) {
        return db.redis.get(key).then(function (val) { return JSON.parse(val); });
    };

    db.cache.del = function (key) {
        return db.redis.del(key);
    };

    db.cache.cleanup = function (prefix) {
        if (_.isString(prefix)) {
            prefix = config('redis.dbCachePrefix')+'.'+prefix
        } else {
            prefix = config('redis.dbCachePrefix');
        }

        return db.redis.cleanup(prefix+'*');
    };

    // helper to close db
    db.close = function () {
        return Promise.all([
            db.knex.destroy(),
            db.redis.quit()
        ]);
    };

    // this is where we load up all the table definitions
    db.loadTables(db);

    // return a promise which ensures that columnsList of all tables
    // has been loaded
    return Promise.all(_.map(db.tables, function (table) {
        return table.loadColumns();
    }));
};