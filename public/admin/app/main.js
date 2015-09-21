var app = angular.module('app', ['ngMaterial', 'ngAnimate', 'ui.router', 'ngMdIcons']);

app.run(['auth', '$state', '$rootScope', function(auth, $state, $rootScope) {
    FastClick.attach(document.body);
    $rootScope.$on('ng-auth:loginRequired', function (ev) {
        $state.go('login');
    });

    $rootScope.$on('ng-auth:logoutUser', function (ev) {
        $state.go('login');
    });
}]);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.definePalette('brand', {
        "50": "#e6f9f6",
        "100": "#b3ece4",
        "200": "#80dfd2",
        "300": "#55d4c3",
        "400": "#2acab4",
        "500": "#00bfa5",
        "600": "#00a790",
        "700": "#008f7c",
        "800": "#007767",
        "900": "#006053",
        "A100": "#b3ece4",
        "A200": "#80dfd2",
        "A400": "#2acab4",
        "A700": "#008f7c",

        "contrastDefaultColor": "light"
    });

    $mdThemingProvider.theme('default')
        .primaryPalette('brand')
        .accentPalette('purple');
}]);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $httpProvider.interceptors.push(['$q', '$location', '$rootScope', function($q,
            $location, $rootScope) {
            return {
                'responseError': function(rejection) {
                    if (rejection.status === 401 || rejection.status === 403) {
                        $rootScope.$broadcast("ng-auth:loginRequired", rejection);
                    }
                    return $q.reject(rejection);
                }
            };
        }]);
        $urlRouterProvider.otherwise('/reviews');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'details/login.html',
                controller: 'details.login'
            })
            .state('reviews', {
                url: '/reviews',
                templateUrl: 'details/reviews.html',
                controller: 'details.reviews'
            });
    }
]);

app.controller('master', [
    '$scope', '$window', '$timeout', '$location', '$rootScope', 'api',
    function($scope, $window, $timeout, $location, $rootScope, api) {

    /*    api.get('/reviewables').then(function(body) {
            console.log(body);
            $scope.reviewables = body.data;
            $scope.reviewablesLoaded = true;
        });*/
    }
]);