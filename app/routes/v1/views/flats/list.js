module.exports = function (view, flats, includes) {
    return {
        data: flats.map(function (f) {
            return view('flats/model')(f, includes).data;
        })
    };
};