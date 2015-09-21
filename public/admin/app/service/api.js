var app = angular.module('app');

app.factory('api', [
    '$http',
    function ($http) {
        var apiBase = 'http://ec2-52-26-213-120.us-west-2.compute.amazonaws.com';
        //var apiBase = 'http://localhost:3030';

        var api = function (method, url, params) {
            params = params || {};
            params.method = method;
            params.url = apiBase + url;

            params.headers = params.headers || {};

            params.headers['Content-Type'] = 'application/json';

            return $http(params).then(function (res) {
                return res.data;
            }).catch(function (err) {
                return err;
            });
        };

        ['GET', 'PUT', 'POST', 'DELETE'].forEach(function (method) {
            api[method.toLowerCase()] = api.bind(this, method);
        }.bind(this));

        return api;
    }
]);