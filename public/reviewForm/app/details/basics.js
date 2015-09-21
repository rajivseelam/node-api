var app = angular.module('app');

app.controller('details.basics', [
    '$scope',
    function ($scope) {
        $scope.reviewer = {
            slug: null, 
            show: true,
            model: null,
            options: [
                {slug: 'current-residence', title: 'Current Residence'},
                {slug: 'previous-residence', title: 'Previous Residence'},
                {slug: 'others-residence', title: 'Someone Else\'s Residence'}
            ],
            setModel: function () {
                this.model = this.options.filter(function (o) {
                    return o.slug === this.slug;
                }.bind(this))[0];
            }
        };

        $scope.resident = {
            slug: null, 
            show: true,
            model: null,
            options: $scope.reviewable('type-of-residents').tags.map(function (t) {
                return {slug: t.slug, title: t.title};
            }),
            setModel: function () {
                this.model = this.options.filter(function (o) {
                    return o.slug === this.slug;
                }.bind(this))[0];
            }
        };

        $scope.stayDuration = {
            show: true,
            monthsAgo: 0,
            text: null,
            calculateText: function () {
                var monthsAgo = parseInt(this.monthsAgo);
                
                if (monthsAgo === 0) {
                    this.text = 'Moved in Recently';
                } else  if (monthsAgo > 36) {
                    this.text = 'More than 3 Years';
                } else {
                    var years = Math.floor(monthsAgo / 12);
                    var months = monthsAgo % 12;

                    var yearsText, monthsText;

                    if (years === 0) {
                        yearsText = '';
                    } else if (years === 1) {
                        yearsText = years + ' Year'
                    } else {
                        yearsText = years + ' Years'
                    }

                    if (months === 0) {
                        monthsText = '';
                    } else if (months === 1) {
                        monthsText = months + ' Month';
                    } else {
                        monthsText = months + ' Months';
                    }

                    var parts = [yearsText, monthsText];

                    this.text = parts.filter(function (p) {
                        return p.trim().length > 0;
                    }).join(', ');
                }
            }
        };

        $scope.askRent = true;

        $scope.$watch('resident.slug', function (newVal, oldVal) {
            $scope.askRent = newVal !== 'owners';
            if ($scope.askRent === false) {
                $scope.rent.show = false;
            }
        });

        $scope.rent = {
            show: true,
            val: 0,
            keyCode: 'NA',
            text: null,
            setText: function () {
                var val = parseInt(this.val);
                if (! isNaN(val)) {
                    this.text = 'INR ' + val;
                }
            },
            enterKey: function (e) {
                if(e.keyCode === 13) {
                    this.showRent = false;
                }
            },
            handleNext: function (e) {
                console.log(e);
                if (e.which === 9) {
                    this.showRent = false;
                }
            }
        };

        $scope.$watch(function () {
            return ['reviewer', 'resident', 'stayDuration', 'rent'].reduce(function (result, field) {
                return result || $scope[field].show;
            }, false);
        }, function (newVal, oldVal) {
            if (newVal === false) {
                $scope.nextStep();
            }
        });

        $scope.nextStep = function () {
            if ($scope.reviewer.slug) {
                $scope.setData('ownership', $scope.reviewer.slug);
            }

            if ($scope.resident.slug) {
                $scope.addDataTags([
                    $scope.reviewTag('type-of-residents', $scope.resident.slug).id
                ]);
            }

            $scope.setData('moved_out_on', moment().toString());
            $scope.setData('moved_in_on', moment().subtract($scope.stayDuration.monthsAgo, 'months').toString());

            if ($scope.askRent) {
                $scope.setData('rent', $scope.rent.val);
            }

            $scope.moveToNextStep();
        };
    }
]);