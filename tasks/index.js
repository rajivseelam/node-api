module.exports = {
    'seed': require('./seed'),
    
    'migrate'         : require('./migrate').latest,
    'migrate:latest'  : require('./migrate').latest,
    'migrate:make'    : require('./migrate').make,
    'migrate:rollback': require('./migrate').rollback,
    'migrate:version' : require('./migrate').version,
    'migrate:reset'   : require('./migrate').reset,
    'migrate:refresh' : require('./migrate').refresh,

    'import:flats' : require('./importFlats'),

    'spread:flats': require('./spreadFlats'),

    'latLonLogToJson': require('./latLonLogToJson'),

    'ng:build': require('./ngBuild'),

    'fix:latLons': require('./fixLatLons')
};