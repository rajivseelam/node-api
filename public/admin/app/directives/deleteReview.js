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