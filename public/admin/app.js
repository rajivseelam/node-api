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
angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("details/login.html","<div id=\"content\" layout=\"row\" layout-padding layout-margin layout-align=\"center center\">\n    <md-content layout=\"column\" layout-padding layout-margin flex=\"45\" flex-sm=\"66\" offset=\"66\">\n        <md-card layout-padding layout-margin flex-sm=\"66\"  flex=\"45\" offset=\"66\">\n            <md-toolbar layout=\"row\">\n                <div class=\"md-toolbar-tools\">\n                    <h1>Admin Login</h1>\n                </div>\n            </md-toolbar>\n            <form name=\"loginForm\" layout-padding layout-margin>\n                <md-input-container layout-padding layout-margin>\n                    <input ng-model=\"user.email\" name=\"email\" type=\"email\" placeholder=\"Email (required)\" ng-required=\"true\">\n                </md-input-container>\n                <md-input-container layout-padding layout-margin>\n                    <input ng-model=\"user.password\" name=\"password\" type=\"password\" placeholder=\"Password (required)\" ng-required=\"true\">\n                </md-input-container>\n            </form>\n            <div class=\"md-actions\" layout=\"row\" layout-align=\"center center\" ng-click=\"login()\">\n                <md-button class=\"md-raised md-primary\">Login</md-button>\n            </div>\n        </md-card>\n    </md-content>\n</div>");
$templateCache.put("details/reviews.html","<div layout=\"row\" layout-margin layout-padding ng-if=\"reviews.length > 0\">\n    <md-sidenav class=\"md-sidenav-left md-whiteframe-z4\" md-component-id=\"left\" md-is-locked-open=\"$mdMedia(\'gt-md\')\" nav-height>\n        <md-toolbar class=\"md-theme-indigo\">\n            <h1 class=\"md-toolbar-tools\">New Review items</h1>\n        </md-toolbar>\n        <md-content nav-height>\n            <section layout=\"column\" layout-padding layout-padding flex>\n                <div layout=\"row\">\n                    <div>\n                        <md-checkbox ng-model=\"tags.all\" aria-label=\"Select All\" ng-change=\"addBulkToSelected(reviews)\">\n                            Select All\n                        </md-checkbox>\n                    </div>\n                    <div>\n                        <!-- <md-button ng-show=\"tags.all\" md-no-ink class=\"md-primary\">Import All</md-button> -->\n                        <md-button ng-show=\"selected.length > 1\" md-no-ink class=\"md-primary\" ng-click=\"exportBatchReviews()\">Import Selected</md-button>\n                    </div>\n                </div>\n                <md-divider></md-divider>\n                <md-list layout-padding>\n                    <md-list-item class=\"md-3-line\" ng-repeat=\"item in reviews track by $index\" ng-click=\"selectUserIndex($index)\">\n                        <md-checkbox ng-disabled=\"false\" flex=\"10\" ng-checked=\"exists(item.id, selected)\" ng-click=\"toggle(item.id, selected)\" layout-padding layout-margin>\n                        </md-checkbox>\n                        <div class=\"md-list-item-text\" flex=\"63\">\n                            <h3>{{ item.user.full_name }}</h3>\n                            <h4>{{ item.remarks}}</h4>\n                            <p>{{ item.created_at | dateFormat }}</p>\n                        </div>\n                        <md-divider></md-divider>\n                    </md-list-item>\n                </md-list>\n            </section>\n        </md-content>\n    </md-sidenav>\n    <md-content flex class=\"md-whiteframe-z3\" layout-gt-sm=\"column\" layout-padding layout-margin>\n        <md-subheader class=\"md-no-sticky\">Viewing Temp Review Created By {{selectedItem.user.username}}</md-subheader>\n        <div layout=\"column\" layout-padding layout-margin>\n            <div layout=\"column\" layout-padding layout-margin>\n                <section id=\"creator\" layout=\"column\" layout-padding>\n                    <p class=\"md-subhead\"><b>Created By:</b> {{selectedItem.user.full_name}}</p>\n                    <div layout=\"row\">\n                        <md-chips>\n                            <md-chip><b>Created At:</b> {{selectedItem.created_at | dateFormat}}</md-chip>\n                        </md-chips>\n                        <md-chips>\n                            <md-chip><b>Updated At:</b> {{selectedItem.updated_at | dateFormat}}</md-chip>\n                        </md-chips>\n                    </div>\n                    <p class=\"md-subhead\">Stay Timeline</p>\n                    <div layout=\"row\">\n                        <md-chips>\n                            <md-chip><b>Moved In On: </b>{{selectedItem.moved_in_on | dateFormat}}</md-chip>\n                        </md-chips>\n                        <md-chips>\n                            <md-chip><b>Moved Out On: </b>{{selectedItem.moved_out_on| dateFormat}}</md-chip>\n                        </md-chips>\n                    </div>\n                    <p class=\"md-subhead\">Flat Ratings</p>\n                    <div layout=\"row\">\n                        <md-chips>\n                            <md-chip><b>User rating:</b> {{selectedItem.user_rating }}</md-chip>\n                        </md-chips>\n                        <md-chips>\n                            <md-chip><b>Flatabout rating:</b> {{selectedItem.flatabout_rating }}</md-chip>\n                        </md-chips>\n                    </div>\n                    <h2 class=\"md-subhead\" ng-if=\"selectedItem.tags\">Selected Tags.</h2>\n                    <div layout=\"row\">\n                        <md-chips>\n                            <md-chip ng-repeat=\"tag in selectedItem.tags\">{{tag.title}}</md-chip>\n                        </md-chips>\n                    </div>\n                </section>\n            </div>\n            <div layout=\"column\" layout-padding layout-margin>\n                <!-- Map marker with lat lang -->\n                <p class=\"md-subhead\">Address</p>\n                <div layout=\"column\">\n                    <md-chips>\n                        <md-chip><b>Full: </b>{{selectedItem.address.full}}</md-chip>\n                        <md-chip><b>Flat #: </b>{{selectedItem.address.flat_number}}</md-chip>\n                        <md-chip><b>Locality: </b>{{selectedItem.address.locality}}</md-chip>\n                        <md-chip><b>Pincode: </b>{{selectedItem.address.pincode}}</md-chip>\n                    </md-chips>\n                </div>\n                <p class=\"md-subhead\">Additional Info</p>\n                <div layout=\"column\">\n                    <md-chips>\n                        <md-chip><b>Remarks: </b>{{selectedItem.remarks}}</md-chip>\n                        <md-chip><b>Rent: </b>{{selectedItem.rent}}</md-chip>\n                        <md-chip><b>Review ID: </b>{{selectedItem.review_id}}</md-chip>\n                        <md-chip><b>Payment Method: </b>{{selectedItem.payment_method}}</md-chip>\n                        <md-chip><b>Is Anon: </b>{{selectedItem.make_anonymous}}</md-chip>\n                        <md-chip><b>lat: </b>{{selectedItem.lat}}</md-chip>\n                        <md-chip><b>lon: </b>{{selectedItem.lon}}</md-chip>\n                    </md-chips>\n                </div>\n            </div>\n            <div layout=\"row\" layout-align=\"end end\" style=\"position: absolute;bottom: 1%;right: 1%;\">\n                <md-fab-speed-dial md-open=\"demo.isOpen\" md-direction=\"{{demo.selectedDirection}}\" ng-class=\"demo.selectedMode\">\n                    <md-fab-trigger>\n                        <md-button aria-label=\"menu\" class=\"md-fab md-warn\">\n                            <ng-md-icon icon=\"menu\" style=\"fill:white\"></ng-md-icon>\n                        </md-button>\n                    </md-fab-trigger>\n                    <md-fab-actions>\n                        <md-button aria-label=\"approve\" class=\"md-fab md-raised md-mini md-\" action-state review=\"{{selectedItem.id}}\" index=\"{{selectedItem.index}}\" ng-click=\"action()\">\n                            <ng-md-icon icon=\"check_circle\"></ng-md-icon>\n                        </md-button>\n                        <md-button aria-label=\"anon\" class=\"md-fab md-raised md-mini\" ng-disabled=\"true\">\n                            <ng-md-icon icon=\"mode_edit\"></ng-md-icon>\n                        </md-button>\n                        <md-button aria-label=\"reject\" class=\"md-fab md-raised md-mini\" delete-review review=\"{{selectedItem.id}}\" index=\"{{selectedItem.index}}\" ng-click=\"actionDelete()\">\n                            <ng-md-icon icon=\"delete\"></ng-md-icon>\n                        </md-button>\n                    </md-fab-actions>\n                </md-fab-speed-dial>\n            </div>\n        </div>\n    </md-content>\n</div>\n<h1 class=\"md-display-3\" offset=\"33\" ng-if=\"reviews.length == 0\">Thats all folks!</h1>");}]);
var app = angular.module('app');

app.controller('details.login', [
    '$scope', 'auth', '$state',
    function ($scope, auth, $state) {
        $scope.user = {};
        $scope.foo = "baarr";
        $scope.login = function() {
            if(!$scope.user.email && !$scope.user.password) {
                return;
            }
            auth.login($scope.user);
        };
        $scope.$on('ng-auth:loginSuccess', function (event) {
            //console.log(event.data);
            $state.go('reviews');
        });
    }
]);
var app = angular.module('app');

app.filter('dateFormat', function($filter) {
    return function(input) {
        if (input == null) {
            return "";
        }

        var _date = $filter('date')(new Date(input), 'MMM dd yyyy');

        return _date.toUpperCase();

    };
});

app.controller('details.reviews', [
    '$scope', 'auth', 'api', '$timeout', '$q', '$mdToast', '$animate', '$mdSidenav', '$mdUtil',
    function($scope, auth, api, $timeout, $q, $mdToast, $animate, $mdSidenav, $mdUtil) {
        api.get('/temp-reviews').then(function(body) {
            $scope.reviews = body.data;
            $scope.selectedItem = body.data[0];
        });

        $scope.close = function() {
            $mdSidenav('left').close()
                .then(function() {
                    console.log("close LEFT is done");
                });
        };

        $scope.demo = {
            topDirections: ['left', 'up'],
            bottomDirections: ['down', 'right'],
            isOpen: false,
            availableModes: ['md-fling', 'md-scale'],
            selectedMode: 'md-scale',
            availableDirections: ['up', 'down', 'left', 'right'],
            selectedDirection: 'up'
        };


        $scope.selected = [];
        $scope.tags = {};
        $scope.toastPosition = {
            bottom: true,
            top: false,
            left: false,
            right: true
        };

        $scope.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
        };
        $scope.exists = function(item, list) {
            return list.indexOf(item) > -1;
        };
        $scope.addBulkToSelected = function(list) {
            if ($scope.selected.length === 0) {
                $scope.selected = _.pluck(list, 'id');
            } else {
                $scope.selected = [];
            }
        };
        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition)
                .filter(function(pos) {
                    return $scope.toastPosition[pos];
                })
                .join(' ');
        };

        $scope.selectedUserIndex = undefined;
        $scope.selectUserIndex = function(index) {
            if ($scope.selectedUserIndex !== index) {
                console.log(index);
                $scope.selectedUserIndex = index;
                var selectedItem = $scope.reviews[index];
                api.get('/temp-reviews/' + selectedItem.id)
                    .then(function(body) {
                        $scope.selectedItem = body.data;
                        $scope.selectedItem.index = index;
                        $scope.close();
                    });
            } else {
                $scope.selectedUserIndex = undefined;
            }
        };

        $scope.exportBatchReviews = function() {
            if ($scope.selected.length < 1) {
                return;
            }
            api.post('/temp-reviews/export/batch', {
                    data: {
                        "batchIds": $scope.selected
                    }
                })
                .then(function(data) {
                    if (data.status === 500) {
                        $mdToast.show(
                            $mdToast.simple()
                            .content('Bulk Review Export Failed,  There Might be duplicate flats or duplicate reviews from same user')
                            .position($scope.getToastPosition())
                            .hideDelay(3000)
                        );
                        return;
                    }
                    $mdToast.show(
                        $mdToast.simple()
                        .content('Review Export Successful')
                        .position($scope.getToastPosition())
                        .hideDelay(3000)
                    );
                    api.get('/temp-reviews').then(function(body) {
                        $scope.reviews = body.data;
                        $scope.selectedItem = body.data[0];
                    });
                });
        };
        $scope.$on('import-failed', function(ev, args) {
            //$scope.selectedItem = $scope.reviews[args.data];
            $mdToast.show(
                $mdToast.simple()
                .content('Review ' + $scope.selectedItem.id + ' Export Failed, server error')
                .position($scope.getToastPosition())
                .hideDelay(3000)
            );
        });
        $scope.$on('import-success', function(ev, args) {
            $scope.reviews.splice(args.data, 1);
            $mdToast.show(
                $mdToast.simple()
                .content('Review ' + $scope.selectedItem.id + ' Successful')
                .position($scope.getToastPosition())
                .hideDelay(3000)
            );
            if ($scope.reviews.length > -1) {
                api.get('/temp-reviews').then(function(body) {
                    $scope.selectedItem = body.data[0];
                });
            } else {
                $scope.reviews = [];
            }
        });

        $scope.$on('delete-failed', function(ev, args) {
            //$scope.selectedItem = $scope.reviews[args.data];
            $mdToast.show(
                $mdToast.simple()
                .content('Review ' + $scope.selectedItem.id + ' delete Failed, server error')
                .position($scope.getToastPosition())
                .hideDelay(3000)
            );
        });
        $scope.$on('delete-success', function(ev, args) {
            $scope.reviews.splice(args.data, 1);
            $mdToast.show(
                $mdToast.simple()
                .content('Review ' + $scope.selectedItem.id + ' deleted')
                .position($scope.getToastPosition())
                .hideDelay(3000)
            );
            if ($scope.reviews.length > -1) {
                api.get('/temp-reviews').then(function(body) {
                    $scope.selectedItem = body.data[0];
                });
            } else {
                $scope.reviews = [];
            }
        });


    }
]);
var app = angular.module('app');

app.directive('actionState', ['api', '$parse', '$rootScope', function(api, $parse, $rootScope) {
    /*
     * Inject  methods to scope that can be used directly with
     * directive.
     * Example:
     * <a auth-status ng-click="logout()">Logout</a>
     *
     **/
    return {
        link: function(scope, element, attrs) {
            var state = attrs.state;
            scope.val = $parse(attrs.review)(scope);
            scope.action = function() {
                api.post('/temp-reviews/'+$parse(attrs.review)(scope) + '/export')
                .then(function (body) {
                    console.log(body.status);
                    if(body.status === 500) {
                        $rootScope.$broadcast('import-failed', { data: d});
                        return;
                    }
                    var d = $parse(attrs.index)(scope);
                    $rootScope.$broadcast('import-success', { data: d});
                });
            };
        }
    };
}]);


var app = angular.module('app');

app.directive('deleteReview', ['api', '$parse', '$rootScope', function(api, $parse, $rootScope) {
    /*
     * Inject  methods to scope that can be used directly with
     * directive.
     * Example: TODO
     *
     **/
    return {
        link: function(scope, element, attrs) {
            var state = attrs.state;
            scope.val = $parse(attrs.review)(scope);
            scope.actionDelete = function() {
                api.delete('/temp-reviews/'+$parse(attrs.review)(scope))
                .then(function (body) {
                    console.log(body.status);
                    if(body.status === 500) {
                        $rootScope.$broadcast('delete-failed', { data: d});
                        return;
                    }
                    var d = $parse(attrs.index)(scope);
                    $rootScope.$broadcast('delete-success', { data: d});
                });
            };
        }
    };
}]);
var app = angular.module('app');

app.directive('navToggle', ['$mdSidenav', '$mdUtil', '$log', function($mdSidenav, $mdUtil, $log) {
    /*
     * Inject  methods to scope that can be used directly with
     * directive.
     * Example:
     * <a auth-status ng-click="logout()">Logout</a>
     *
     **/
    return {
        link: function(scope, element, attrs) {

            scope.toggleLeft = buildToggler('left');
            /*$scope.toggleRight = buildToggler('right');*/
            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
            function buildToggler(navID) {
                var debounceFn = $mdUtil.debounce(function() {
                    $mdSidenav(navID)
                        .toggle()
                        .then(function() {
                            $log.debug("toggle " + navID + " is done");
                        });
                }, 300);
                return debounceFn;
            }

        }
    };
}]);

app.directive('navHeight', [
    '$window', '$timeout',
    function($window, $timeout) {
        return {
            restrict: 'A',
            link: function($scope, $el, $attr) {
                $el.addClass('window-height');
                var height = $window.screen.height;
                $el.css({
                    height: height
                });

                angular.element($window).bind('resize', function() {
                    $timeout(function() {
                        var height = $window.screen.height;
                        console.log($el);
                        console.log("height changed");
                        $el.css({
                            height: height
                        });
                    }, 100);
                });
            }
        };
    }
])
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
var app = angular.module('app');

app.factory('auth', ['$http', '$rootScope', 'api',
        function($http, $rootScope, api) {

            var apiBasePath = null;
            var loginTokenEndpoint = '/auth/login';
            // The endpoint from which the user information can be obtained
            // /me is default nereid url to fetch user status
            var userInfoEndpoint = '/auth/profile';
            var regEndPoint = '/auth/register';
            var token = localStorage.getItem('token');
            var user = JSON.parse(localStorage.getItem('user'));

            var setHeaders = function(token) {
                if (!token) {
                    delete $http.defaults.headers.common['Authorization'];
                    return;
                }
                $http.defaults.headers.common['Authorization'] = 'Bearer'+ ' ' + token.toString();

            };
            var isLoggedIn = function() {
                if (token) {
                    return true;
                } else {
                    return false;
                }
            };

            var refreshUserInfo = function() {
                //Check Token Refresh and Validity here 
                if (!user) {
                    return;
                }
                return api.get(userInfoEndpoint).then(function (body) {
                  angular.extend(user, body.data);
                });
            };

            if (token) {
                setHeaders(token);
                refreshUserInfo()
                    .catch(function(data, status) {
                        console.log(data);
                        if (status === 401 || status === 403 || status === 404) {
                            logoutUser();
                        }
                    });
            };

            var setToken = function(newToken) {
                if (!newToken) {
                    localStorage.removeItem('token');
                } else {
                    localStorage.setItem('token', newToken);
                }
                setHeaders(newToken);
                token = newToken;
                if (newToken) {
                    refreshUserInfo();
                }
            };
            var logoutUser = function() {
                // Clear the token
                setToken(null);
                localStorage.removeItem('user');
                $rootScope.$broadcast("ng-auth:logoutUser");
            };
            var login = function(data) {

                return api.post(loginTokenEndpoint, {data: JSON.stringify(data)}).then(function (body) {
                    user = body.data;
                    localStorage.setItem('user', JSON.stringify(user));
                    setToken(user.access_token);
                    $rootScope.$broadcast("ng-auth:loginSuccess", data);
                }).catch(function (reason) {
                    $rootScope.$broadcast("ng-auth:loginFailed", {
                        reason: reason.data,
                        status: reason.status
                    });
                    logoutUser();
                });
            };

            var register = function(data) {
                return $http({
                    method: 'POST',
                    url: apiBasePath + regEndPoint,
                    headers: {
                        'Content-Type': 'application/json;',
                        'X-DeviceId': 'web'
                    },
                    data: JSON.stringify(data)
                }).success(function(data) {
                    user = data;
                    localStorage.setItem('user', JSON.stringify(user));
                    setToken(data.access_token);
                    $rootScope.$broadcast("ng-auth:loginSuccess", data);
                }).error(function(reason, status, headers) {
                    $rootScope.$broadcast("ng-auth:loginFailed", {
                        reason: reason,
                        status: status,
                        headers: headers()
                    });
                    logoutUser();
                });
            };

            //public methods & properties
            var self = {
                setLoginEndpoint: function(new_end_point) {
                    loginTokenEndpoint = new_end_point;
                },
                setUserInfoEndpoint: function(new_end_point) {
                    userInfoEndpoint = new_end_point;
                },
                setapiBasePath: function(new_base_path) {
                    apiBasePath = new_base_path;
                },
                login: login,
                register: register,
                logoutUser: logoutUser,
                refreshUserInfo: refreshUserInfo,
                isLoggedIn: isLoggedIn,
                user: function() {
                    return user;
                }
            };
            return self;
        }
    ])
    .directive('showIfAuth', ['$animate', 'auth', function($animate,
        auth) {
        return function(scope, element) {
            scope.$watch(function() {
                return auth.isLoggedIn();
            }, function() {
                $animate[auth.isLoggedIn() ? 'removeClass' :
                    'addClass'](
                    element, 'ng-hide');
            });
        };
    }])
    .directive('hideIfAuth', ['$animate', 'auth', function($animate,
        auth) {
        return function(scope, element) {
            scope.$watch(function() {
                return auth.isLoggedIn();
            }, function() {
                $animate[auth.isLoggedIn() ? 'addClass' :
                    'removeClass'](
                    element, 'ng-hide');
            });
        };
    }])
    .directive('authStatus', ['auth', '$window', function(auth, $window) {
        /*
         * Inject auth methods to scope that can be used directly with
         * directive.
         * Example:
         * <a auth-status ng-click="logout()">Logout</a>
         *
         **/
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.logout = function() {
                    if ($window.confirm("Are you sure you want to Logout ?")) {
                        auth.logoutUser();
                    }
                };
            }
        };
    }]);