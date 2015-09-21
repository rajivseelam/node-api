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

