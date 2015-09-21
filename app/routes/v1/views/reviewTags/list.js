module.exports = function (view, tags) {
    return {
        data: tags.map(function (r) {
            return view('reviewTags/model')(r).data
        })
    };
};