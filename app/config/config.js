var _ = require('lodash');

function retriever(parts, obj, fallback, env) {
    if (parts.length === 0) {
        return _.isObject(obj) && obj.hasOwnProperty[env] ? obj[env] : obj;
    }

    var key = parts[0];
    var rest = parts.slice(1);
    var head = obj[key];

    if (_.isObject(head)) {
        if (rest.length === 0) {
            return head.hasOwnProperty(env) ? head[env] : head;
        } else {
            return retriever(rest, head.hasOwnProperty(env) ? head[env] : head, fallback, env);
        }
    } else {
        return rest.length === 0 && head !== undefined ? head : fallback;
    }
};

module.exports = function (env, properties) {

    var config = function (key, fallback) {
        if (! _.isUndefined(config._cache[key])) {
            return config._cache[key];
        } else {
            var result = retriever(key.split('.'), config, fallback, env)
            config._cache[key] = result;
            return result;
        }
    };

    _.extend(config, properties);

    config.env = env;
    config._cache = {};

    return config;
};