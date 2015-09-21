var app = angular.module('app');

app.directive('questionCard', [
    '$window',
    function ($window) {
        return {
            restrict: 'A',
            link: function ($scope, $el, $attr) {
                $el.addClass('question-card');
                var height = 0.65 * $window.screen.height;

                $el.css({height: height});
            }
        };
    }
])