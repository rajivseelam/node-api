var app = angular.module('app');

app.controller('details.livingConditions', [
    '$scope',
    function ($scope) {
        $scope.waterProblemsExist = {
            val: null,
            show: true,
            text: null,
            options: $scope.reviewable('water-problems').tags.filter(function (t) {
                return t.slug === 'no';
            }).map(function (t) {
                return {val: t.slug, title: t.title};
            }).concat([
                {val: 'yes', title: 'Yes'}
            ]),
            setText: function () {
                var opt = this.options.filter(function (o) {
                    return o.val === this.val;
                }.bind(this))[0];

                if (opt) {
                    this.text = opt.title
                }
            }
        };

        $scope.$watch('waterProblemsExist.val', function (newVal, oldVal) {
            $scope.waterProblems.show = (newVal === 'yes');
        });

        $scope.waterProblems = {
            val: [],
            show: false,
            options: $scope.reviewable('water-problems').tags.filter(function (t) {
                return t.slug !== 'no';
            }).map(function (t) {
                return {val: t.slug, title: t.title};
            }),
            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },
            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            }
        };

        $scope.powerSupply = {
            val: null,
            show: true,
            text: null,
            options: $scope.reviewable('power-supply').tags.map(function (t) {
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

        $scope.livingProblems = {
            val: [],
            show: {first: true, second: true},
            options: {
                first: $scope.reviewable('problems').tags.filter(function (t) {
                    return [
                        'poor-drainage', 'poor-ventilation', 'no-western-toilet',
                        'sanitation-problems', 'bad-maintenance'
                    ].indexOf(t.slug) > -1;
                }).map(function (t) {
                    return {val: t.slug, title: t.title};
                }),
                second: $scope.reviewable('problems').tags.filter(function (t) {
                    return [
                        'poor-drainage', 'poor-ventilation', 'no-western-toilet',
                        'sanitation-problems', 'bad-maintenance'
                    ].indexOf(t.slug) === -1;
                }).map(function (t) {
                    return {val: t.slug, title: t.title};
                })
            },

            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },

            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            },
        };

        $scope.facilities = {
            val: [],
            show: {first: true, second: true},
            options: {
                first: $scope.reviewable('facilitiesessentials').tags.filter(function (t) {
                    return [
                        'cupboards', 'bed', 'gas-stove',
                        'cylinder', 'fittings-padlocks-etc'
                    ].indexOf(t.slug) > -1;
                }).map(function (t) {
                    return {val: t.slug, title: t.title};
                }),
                second: $scope.reviewable('facilitiesessentials').tags.filter(function (t) {
                    return [
                        'cupboards', 'bed', 'gas-stove',
                        'cylinder', 'fittings-padlocks-etc'
                    ].indexOf(t.slug) === -1;
                }).map(function (t) {
                    return {val: t.slug, title: t.title};
                })
            },
            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },
            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            }
        };

        $scope.landlordCharacteristics = {
            val: [],
            show: true,
            options: $scope.reviewable('characteristics-of-landlord').tags.map(function (t) {
                return {val: t.slug, title: t.title};
            }),
            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },
            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            }
        };

        $scope.localityOverview = {
            val: [],
            show: {first: true, second: true},
            options: {
                first: $scope.reviewable('overview-of-locality').tags.filter(function (t) {
                    return [
                        'unsafe-for-women', 'crime-prone', 'parking-problems',
                        'improper-roads', 'inaccessible-via-car'
                    ].indexOf(t.slug) > -1;
                }).map(function (t) {
                    return {val: t.slug, title: t.title};
                }),
                second: $scope.reviewable('overview-of-locality').tags.filter(function (t) {
                    return [
                        'unsafe-for-women', 'crime-prone', 'parking-problems',
                        'improper-roads', 'inaccessible-via-car'
                    ].indexOf(t.slug) === -1;
                }).map(function (t) {
                    return {val: t.slug, title: t.title};
                })
            },
            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },
            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            }
        };

        $scope.neighbours = {
            val: [],
            show: true,
            options: $scope.reviewable('neighbours').tags.map(function (t) {
                return {val: t.slug, title: t.title};
            }),
            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },
            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            }
        };

        $scope.rentPayment = {
            val: [],
            show: true,
            options: $scope.reviewable('payment-method').tags.map(function (t) {
                return {val: t.slug, title: t.title};
            }),
            isItemListed: function (opt) {
                return this.val.indexOf(opt.val) > -1
            },
            toggleItem: function (opt) {
                if (this.isItemListed(opt)) {
                    this.val = this.val.filter(function (v) {
                        return v !== opt.val;
                    });
                } else {
                    this.val.push(opt.val);
                }
            }
        };

        $scope.$watch(function () {

                return ['waterProblemsExist', 
                        'waterProblems', 
                        'powerSupply', 
                        'livingProblems', 
                        'facilities', 
                        'landlordCharacteristics', 
                        'localityOverview', 
                        'neighbours', 
                        'rentPayment']
                        .reduce(function (result, field) {
                            // console.log(result, field);
                            if ($scope[field].show instanceof Object) {
                                return Object.keys($scope[field].show).reduce(function (result, subfield) {
                                    return result || $scope[field].show[subfield];
                                }, result);
                            } else {
                                return result || $scope[field].show;
                            }
                        }, false);
            }, function (newVal, oldVal) {
                if (newVal === false) {
                    $scope.nextStep();
                }
            });

        $scope.nextStep = function () {
            if ($scope.waterProblemsExist.val === 'yes') {
                var waterTags = $scope.reviewable('water-problems').tags.filter(function (t) {
                    return $scope.waterProblems.val.indexOf(t.slug) > -1;
                });

                $scope.addDataTags(waterTags.map(function (t) { return t.id; }));
            } else {
                $scope.addDataTags([
                    $scope.reviewTag('water-problems', 'no').id
                ]);
            }

            if ($scope.powerSupply.val) {
                $scope.addDataTags([
                    $scope.reviewTag('power-supply', $scope.powerSupply.val).id
                ]);
            }

            if ($scope.livingProblems.val.length > 0) {
                var problemsTags = $scope.reviewable('problems').tags.filter(function (t) {
                    return $scope.livingProblems.val.indexOf(t.slug) > -1
                });

                $scope.addDataTags(problemsTags.map(function (t) { return t.id; }));
            }

            if ($scope.facilities.val.length > 0) {
                var facilitiesTags = $scope.reviewable('facilitiesessentials').tags.filter(function (t) {
                    return $scope.facilities.val.indexOf(t.slug) > -1;
                });

                $scope.addDataTags(facilitiesTags.map(function (t) { return t.id; }));
            }

            if ($scope.landlordCharacteristics.val.length > 0) {
                var landlordTags = $scope.reviewable('characteristics-of-landlord').tags.filter(function (t) {
                    return $scope.landlordCharacteristics.val.indexOf(t.slug) > -1;
                });

                $scope.addDataTags(landlordTags.map(function (t) { return t.id; }));
            }

            if ($scope.localityOverview.val.length > 0) {
                var localityTags = $scope.reviewable('overview-of-locality').tags.filter(function (t) {
                    return $scope.localityOverview.val.indexOf(t.slug) > -1;
                })

                $scope.addDataTags(localityTags.map(function (t) { return t.id; }));
            }

            if ($scope.neighbours.val.length > 0) {
                var neighbourTags = $scope.reviewable('neighbours').tags.filter(function (t) {
                    return $scope.neighbours.val.indexOf(t.slug) > -1;
                });

                $scope.addDataTags(neighbourTags.map(function (t) { return t.id; }));
            }

            if ($scope.rentPayment.val.length > 0) {
                var paymentTags = $scope.reviewable('payment-method').tags.filter(function (t) {
                    return $scope.rentPayment.val.indexOf(t.slug) > -1;
                });

                $scope.addDataTags(paymentTags.map(function (t) { return t.id; }));
            }

            $scope.moveToNextStep();
        };
    }
]);