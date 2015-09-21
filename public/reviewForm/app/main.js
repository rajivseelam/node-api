;
var app = angular.module('app', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.run(function () {
    FastClick.attach(document.body);
})

app.config(['$mdThemingProvider', function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('brand', {
        "50":"#e6f9f6",
        "100":"#b3ece4",
        "200":"#80dfd2",
        "300":"#55d4c3",
        "400":"#2acab4",
        "500":"#00bfa5",
        "600":"#00a790",
        "700":"#008f7c",
        "800":"#007767",
        "900":"#006053",
        "A100":"#b3ece4",
        "A200":"#80dfd2",
        "A400":"#2acab4",
        "A700":"#008f7c",

        "contrastDefaultColor": "light"
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('brand')
      .accentPalette('brand');
}]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {reloadOnSearch: false}).otherwise('/');
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller('master', [
    '$scope', '$window', '$timeout', '$location', '$rootScope', 'api',
    function ($scope, $window, $timeout, $location, $rootScope, api) {

        $scope.parts = [
            {name: 'basics', tmpl: 'details/basics.html'},
            {name: 'residence', tmpl: 'details/residence.html'},
            {name: 'livingConditions', tmpl: 'details/livingConditions.html'},
            {name: 'degreesOfFreedom', tmpl: 'details/degreesOfFreedom.html'},
            {name: 'formalities', tmpl: 'details/formalities.html'}
        ];

        var activePart = $location.search().part;
        var partNames = $scope.parts.map(function (p) { return p.name; });
        activePart = partNames.indexOf(activePart) > -1 ? activePart : partNames[0];

        if ($location.search().part !== activePart) {
            console.log('here');
            $location.search({part: activePart});
        }

        var step = partNames.indexOf(activePart) + 1;
        step = step > 0 ? step : 1;

        $scope.progress = {
            step: step,
            data: {
                tags: []
            },

            residentType: function () {
                return $scope.reviewable('type-of-residents').tags.filter(function (t) {
                    return $scope.progress.data.tags.indexOf(t.id) > -1;
                })[0];
            },
        };

        $scope.setData = function (key, val) {
            $scope.progress.data[key] = val;
        };

        $scope.addDataTags = function (ids) {
            ids.forEach(function (id) {
                if ($scope.progress.data.tags.indexOf(id) === -1) {
                    $scope.progress.data.tags.push(id);
                }
            });
        }

        $scope.reviewables = [];
        $scope.reviewablesLoaded = false;
        
        $scope.reviewable = function (slug) {
            return $scope.reviewables.filter(function (r) {
                return r.slug === slug;
            })[0];
        };

        $scope.reviewTag = function (reviewableSlug, tagSlug) {
            return $scope.reviewable(reviewableSlug).tags.filter(function (t) {
                if (tagSlug instanceof Object && ! (tagSlug instanceof Array)) {
                    var k = Object.keys(tagSlug)[0];
                    return t[k] === tagSlug[k];
                } else {
                    return t.slug === tagSlug;
                }
            })[0];
        };

        $scope.moveToNextStep = function () {
            if (($scope.progress.step + 1) <= $scope.parts.length) {
                $location.search({part: partNames[$scope.progress.step]});
            } else {
                // upload shit here
                console.log(JSON.stringify($scope.progress.data));
                
                if (window.callback !== undefined && window.callback.saveData instanceof Function) {
                    window.callback.saveData(JSON.stringify($scope.progress.data));
                }
            }
        };

        $rootScope.$on('$locationChangeSuccess', function () {
            var part = $location.search().part;
            var partIndex = partNames.indexOf(part);
            partIndex = partIndex > -1 ? partIndex : 0;

            $scope.progress.step = (partIndex + 1);
            $timeout(function () {
                $window.scrollTo(0, 0);
            }, 210);
        });

        api.get('/reviewables').then(function (body) {
            $scope.reviewables = body.data;
            $scope.reviewablesLoaded = true;
        });
    }
]);