module.exports = function (view, reviewables) {
    return {
        data: reviewables.map(function (r) {
            return view('reviewables/model')(r).data
        })
    };
};