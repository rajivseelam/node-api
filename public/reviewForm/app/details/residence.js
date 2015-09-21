app.controller('details.residence', [
    '$scope',
    function ($scope) {
        $scope.residentType = $scope.progress.residentType();

        $scope.numPeople = {
            val: null,
            show: true,
            text: null,
            options: $scope.reviewable('number-of-people').tags.map(function (t) {
                return {val: t.title, title: t.title};
            }),
            setText: function () {
                var opt = this.options.filter(function (o) {
                    return o.val === this.val;
                }.bind(this))[0];

                if (opt) {
                    this.text = opt.title
                }
            }
        };

        $scope.flatType = {
            val: null,
            show: true,
            text: null,
            options: ['1', '2', '3', '3+'].map(function (r) {
                return $scope.reviewTag('number-of-rooms', {title: r});
            }).map(function (t) {
                return {val: t.title, title: t.title + ' BHK'}
            }),
            setText: function () {
                var opt = this.options.filter(function (o) {
                    return o.val === this.val;
                }.bind(this))[0];

                if (opt) {
                    this.text = opt.title
                }
            }
        };

        $scope.demography = {
            val: null,
            show: true,
            text: null,
            options: $scope.reviewable('demography').tags.map(function (t) {
                return {val: t.slug, title: t.title};
            }),
            setText: function () {
                var opt = this.options.filter(function (o) {
                    return o.val === this.val;
                }.bind(this))[0];

                if (opt) {
                    this.text = opt.title
                }
            }
        };

        $scope.$watch(function () {
            return ['numPeople', 'flatType', 'demography'].reduce(function (result, field) {
                return result || $scope[field].show;
            }, false);
        }, function (newVal, oldVal) {
            if (newVal === false) {
                $scope.nextStep();
            }
        });

        $scope.nextStep = function () {
            if ($scope.numPeople.val) {
                $scope.addDataTags([
                    $scope.reviewTag('number-of-people', {title: $scope.numPeople.val}).id
                ]);
            }

            if ($scope.flatType.val) {
                $scope.addDataTags([
                    $scope.reviewTag('number-of-rooms', {title: $scope.flatType.val}).id
                ]);
            }

            if ($scope.demography.val) {
                $scope.addDataTags([
                    $scope.reviewTag('demography', $scope.demography.val).id
                ]);
            }

            $scope.moveToNextStep();
        };
    }
]);