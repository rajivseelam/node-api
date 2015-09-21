// this is the convention for getting env. lets follow this
var env = process.env.NODE_ENV || 'development';

module.exports = require('./config')(env, require('./properties'));