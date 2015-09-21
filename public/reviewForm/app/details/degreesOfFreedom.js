var app = angular.module('app');

app.controller('details.degreesOfFreedom', [
    '$scope',
    function ($scope) {
        $scope.landlordResidence = {
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }

                this.show = false;
            }
        };

        $scope.liveInAllowed = {
            slug: 'live-in',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.drinkingAllowed = {
            slug: 'drinking',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.cookingNonVegAllowed = {
            slug: 'cooking-non-veg',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.smokingAllowed = {
            slug: 'smoking',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.partyingAllowed = {
            slug: 'partying',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.friendsComingOverAllowed = {
            slug: 'friends-coming-over',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.familyComingOverAllowed = {
            slug: 'family-coming-over',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.petsAllowed = {
            slug: 'pets',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.comingLateNightAllowed = {
            slug: 'coming-in-late-night',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.playingLoudMusicAllowed = {
            slug: 'playing-loud-music',
            val: null,
            show: true,
            text: null,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ],
            isVal: function (val) {
                return this.val === val || this.val === null;
            },
            toggleVal: function (val) {
                if (this.val === val) {
                    this.val = null;
                } else {
                    this.val = val;
                }
                this.show = false;
            }
        };

        $scope.$watch(function () {
            return ['liveInAllowed', 'drinkingAllowed',
                'cookingNonVegAllowed', 'smokingAllowed', 'partyingAllowed',
                'friendsComingOverAllowed', 'familyComingOverAllowed',
                'petsAllowed', 'comingLateNightAllowed', 'playingLoudMusicAllowed'
                ].reduce(function (result, field) {
                    return result || $scope[field].show;
                }, false);
        }, function (newVal, oldVal) {
            if (newVal === false) {
                $scope.nextStep();
            }
        });



        $scope.nextStep = function () {
            if ($scope.landlordResidence.val === 'yes') {
                $scope.addDataTags([
                    $scope.reviewTag('landlord-residence', 'yes').id
                ]);
            } else {
                $scope.addDataTags([
                    $scope.reviewTag('landlord-residence', 'no').id
                ]);
            }


            var tagSlugs = [
                'liveInAllowed', 'drinkingAllowed',
                'cookingNonVegAllowed', 'smokingAllowed', 'partyingAllowed',
                'friendsComingOverAllowed', 'familyComingOverAllowed',
                'petsAllowed', 'comingLateNightAllowed', 'playingLoudMusicAllowed'
            ].filter(function (part) {
                return $scope[part].val === 'yes';
            }).map(function (part) {
                var field = $scope[part];
                return field.slug;
            });

            if (tagSlugs.length === 0) {
                $scope.addDataTags([
                    $scope.reviewTag('allowed', 'none').id
                ]);
            } else {
                var allowedTags = $scope.reviewable('allowed').tags.filter(function (t) {
                    return tagSlugs.indexOf(t.slug) > -1;
                });

                $scope.addDataTags(allowedTags.map(function (t) { return t.id; }));
            }

            $scope.moveToNextStep();
        };
    }
]);