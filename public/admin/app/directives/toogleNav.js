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