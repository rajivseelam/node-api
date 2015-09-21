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