// Restrictions : Is X allowed in your flat
// Handle Rent options dynamically
// 
var csv = require('csv');
var fs = require('fs');
var Promise = require('bluebird');
var moment = require('moment');
var request = require('request-promise');

var db = appRequire('db');
var config = appRequire('config');

function resetLatLonLog() {
    fs.writeFileSync(config.path('/tasks/importFlats/latLonLog'), '');
}

function resetInvalidAddressLog() {
    fs.writeFileSync(config.path('/tasks/importFlats/invalidAddressLog'), '');
}

function logLatLon(id, lat, lon) {
    fs.appendFileSync(
        config.path('/tasks/importFlats/latLonLog'),
        (id ? id+'# ' : '')+lat+','+lon+'\n'
    );
}

function logInvalidAddress(id, address) {
    fs.appendFileSync(
        config.path('/tasks/importFlats/invalidAddressLog'),
        id+'# '+address + '\n'
    );
}

var skippables = ['reviewables', 'tags', 'flats', 'addresses', 'processAddress', 'addressToLatLon', 'fixAddresses'];

module.exports = function (gulp) {
    function parseCsv(file, promiseFn) {
        return new Promise(function (resolve, reject) {
            try {
                var rowNum = 0;

                var stream = fs.createReadStream(__dirname+'/'+file);
                var parser = csv.parse();
                var processor = csv.transform(function (row) {
                    console.log(file+':row#'+rowNum);
                    parser.pause();
                    promiseFn(row, rowNum).then(function () {
                        rowNum++;
                        parser.resume();
                        return row;
                    });
                });
                var collector = csv.transform(function () {
                });

                processor.on('end', function () {
                    Promise.delay(1000).then(function () {
                        resolve()
                    });
                });

                stream.pipe(parser).pipe(processor).pipe(collector);
            } catch (e) {
                reject(e);
            }
        });
    };


    var truncate = false;
    var skip = [];
    
    var args = process.argv.slice(3);

    var i1 = args.indexOf('-t');
    if (i1 > -1 && args[i1+1] === '1') {
        truncate = true;
    }

    var i2 = args.indexOf('-s');
    if (i2 > -1 && args[i2+1] !== undefined) {
        skip = args[i2+1].split(',');
    }

    db.load().then(function () {
        if (truncate) {
            return Promise.all([
                db('users').truncate(),
                db('reviewables').truncate(),
                db('review_tags').truncate(),
                db('flats').truncate(),
                db('flat_reviews').truncate(),
                db('flat_review_tag').truncate()
            ]);
        }
    }).then(function () {
        if (skip.indexOf('reviewables') === -1) {
            return parseCsv('reviewables.csv', require('./parsers/reviewables'));
        }
    }).then(function () {
        if (skip.indexOf('tags') === -1) {
            return parseCsv('tags.csv', require('./parsers/tags'));
        }
    }).then(function () {
        if (skip.indexOf('flats') === -1) {
            return parseCsv('flats.csv', require('./parsers/flats'));
        }
    }).then(function () {
        if (skip.indexOf('addresses') === -1) {
            return parseCsv('address.csv', require('./parsers/addresses'));
        }
    }).then(function () {
        // process flat addresses
        if (skip.indexOf('processAddress') === -1) {
            return db('flats').all().then(function (flats) {
                return flats.reduce(function (chain, flat) {
                    return chain.then(function () {
                        [
                            'full', 'flat_number', 'locality',
                            'pincode', 'city', 'state'
                        ].forEach(function (p) {
                            if (flat.address[p]) {
                                flat.address[p] = flat.address[p].replace('\n', ' ');
                            }
                        });

                        console.log('Processing Address of Flat #' + flat.id);
                        return db('flats').save(flat);
                    });
                }, Promise.resolve());
            });
        }
    }).then(function () {
        // fetch and log address lat lon
        resetLatLonLog();
        resetInvalidAddressLog();

        if (skip.indexOf('addressToLatLon') === -1) {
            return db('flats').all().then(function (flats) {
                return flats.reduce(function (chain, flat) {
                    return chain.delay(300).then(function () {
                        var addressParts = [];

                        [
                            'flat_number', 'locality', 'pincode',
                            'city', 'state'

                        ].forEach(function (p) {
                            if (flat.address[p] && flat.address[p].trim().length > 0) {
                                addressParts.push(flat.address[p]);
                            }
                        });

                        var address = addressParts.join(', ');

                        var req = request({
                            json  : true,
                            method: 'GET',
                            uri   : 'https://maps.googleapis.com/maps/api/geocode/json',
                            qs    : {
                                key: 'AIzaSyBVjuZ5Ip0o2pXysQClJmhf6ixy5rDA0EE',
                                address: address
                            },
                            agentOptions: {
                                secureProtocol: 'SSLv3_method'
                            }
                        });

                        return req.then(function (data) {
                            if (data.status === 'OK' && data.results && data.results.length > 0) {
                                if (JSON.stringify(data.results[0]).toLowerCase().indexOf('india') > -1) {
                                    var point = data.results[0].geometry.location;
                                    logLatLon(null, point.lat, point.lng);
                                    flat.lat = point.lat;
                                    flat.lon = point.lng;
                                    return db('flats').save(flat);
                                }
                            } else {
                                throw data;
                            }
                        }).catch(function (e) {
                            console.log(e);
                            logInvalidAddress(flat.id, address);
                        });
                    });
                }, Promise.resolve());
            });
        }
    }).then(function () {
        if (skip.indexOf('fixAddresses') === -1) {
            return parseCsv('fixed_addresses.csv', require('./parsers/fixAddresses'));
        }
    }).delay(3000).then(function () {
        return db.close();
    });
};