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