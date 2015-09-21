var _ = require('lodash');

module.exports = function (view, flat, includes) {
    if (flat.color === undefined && flat.reviews && _.isArray(flat.reviews)) {
        flat.score = 0;
        
        flat.reviews.forEach(function (r) {
            if (r.tags && r.tags.length > 0) {
                r.tags.forEach(function (t) {
                    if (t.reviewable) {
                        flat.score += (t.reviewable.weight * t.score);
                    }
                });
            }
        });

        flat.score = flat.score / flat.reviews.length;

        flat.color = 'yellow';

        if (flat.score <= -20) {
            flat.color = 'red';
        }

        if (flat.score >= 10) {
            flat.color = 'green';
        }
    }

    var addressFields = ['flat_number', 'locality', 'city', 'state', 'pincode'];

    flat.address = addressFields.reduce(function (addr, field) {
        var val = flat.address[field];
        val = _.isString(val) && val.length > 0 ? val : '';
        addr[field] = val;
        return addr;
    }, {});

    flat.address.full = addressFields.filter(function (f) {
        return flat.address[f].length > 0;
    }).map(function (f) {
        return flat.address[f];
    }).join(', ');

    if (_.isArray(includes) && includes.indexOf('reviews') > -1) {
        return {data: flat};
    } else {
        return {data: _.omit(flat, ['reviews'])};
    }
}