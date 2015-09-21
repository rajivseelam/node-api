module.exports = function (view, reviews) {
    return {
        data: reviews.map(function (r) {
            return view('tempReviews/model')(r).data;
        })
    };
};