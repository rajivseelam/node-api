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