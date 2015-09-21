module.exports = function (view, users) {
    return {
        data: users.map(function (u) {
            return view('users/model')(u).data;
        })
    };
};