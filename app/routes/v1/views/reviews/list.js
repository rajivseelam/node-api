module.exports = function (view, reviews, flat, reviewables, format) {
    var o = {
        data: reviews.map(function (r) {
            return view('reviews/model')(r, reviewables, format).data;
        })
    };

    if (flat) {
        o.flat = view('flats/model')(flat).data;
    }

    return o;
};