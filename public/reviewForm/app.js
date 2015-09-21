;
var app = angular.module('app', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.run(function () {
    FastClick.attach(document.body);
})

app.config(['$mdThemingProvider', function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('brand', {
        "50":"#e6f9f6",
        "100":"#b3ece4",
        "200":"#80dfd2",
        "300":"#55d4c3",
        "400":"#2acab4",
        "500":"#00bfa5",
        "600":"#00a790",
        "700":"#008f7c",
        "800":"#007767",
        "900":"#006053",
        "A100":"#b3ece4",
        "A200":"#80dfd2",
        "A400":"#2acab4",
        "A700":"#008f7c",

        "contrastDefaultColor": "light"
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('brand')
      .accentPalette('brand');
}]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {reloadOnSearch: false}).otherwise('/');
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller('master', [
    '$scope', '$window', '$timeout', '$location', '$rootScope', 'api',
    function ($scope, $window, $timeout, $location, $rootScope, api) {

        $scope.parts = [
            {name: 'basics', tmpl: 'details/basics.html'},
            {name: 'residence', tmpl: 'details/residence.html'},
            {name: 'livingConditions', tmpl: 'details/livingConditions.html'},
            {name: 'degreesOfFreedom', tmpl: 'details/degreesOfFreedom.html'},
            {name: 'formalities', tmpl: 'details/formalities.html'}
        ];

        var activePart = $location.search().part;
        var partNames = $scope.parts.map(function (p) { return p.name; });
        activePart = partNames.indexOf(activePart) > -1 ? activePart : partNames[0];

        if ($location.search().part !== activePart) {
            console.log('here');
            $location.search({part: activePart});
        }

        var step = partNames.indexOf(activePart) + 1;
        step = step > 0 ? step : 1;

        $scope.progress = {
            step: step,
            data: {
                tags: []
            },

            residentType: function () {
                return $scope.reviewable('type-of-residents').tags.filter(function (t) {
                    return $scope.progress.data.tags.indexOf(t.id) > -1;
                })[0];
            },
        };

        $scope.setData = function (key, val) {
            $scope.progress.data[key] = val;
        };

        $scope.addDataTags = function (ids) {
            ids.forEach(function (id) {
                if ($scope.progress.data.tags.indexOf(id) === -1) {
                    $scope.progress.data.tags.push(id);
                }
            });
        }

        $scope.reviewables = [];
        $scope.reviewablesLoaded = false;
        
        $scope.reviewable = function (slug) {
            return $scope.reviewables.filter(function (r) {
                return r.slug === slug;
            })[0];
        };

        $scope.reviewTag = function (reviewableSlug, tagSlug) {
            return $scope.reviewable(reviewableSlug).tags.filter(function (t) {
                if (tagSlug instanceof Object && ! (tagSlug instanceof Array)) {
                    var k = Object.keys(tagSlug)[0];
                    return t[k] === tagSlug[k];
                } else {
                    return t.slug === tagSlug;
                }
            })[0];
        };

        $scope.moveToNextStep = function () {
            if (($scope.progress.step + 1) <= $scope.parts.length) {
                $location.search({part: partNames[$scope.progress.step]});
            } else {
                // upload shit here
                console.log(JSON.stringify($scope.progress.data));
                
                if (window.callback !== undefined && window.callback.saveData instanceof Function) {
                    window.callback.saveData(JSON.stringify($scope.progress.data));
                }
            }
        };

        $rootScope.$on('$locationChangeSuccess', function () {
            var part = $location.search().part;
            var partIndex = partNames.indexOf(part);
            partIndex = partIndex > -1 ? partIndex : 0;

            $scope.progress.step = (partIndex + 1);
            $timeout(function () {
                $window.scrollTo(0, 0);
            }, 210);
        });

        api.get('/reviewables').then(function (body) {
            $scope.reviewables = body.data;
            $scope.reviewablesLoaded = true;
        });
    }
]);
angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("main.html","<div class=\"background\"></div>\n\n<div layout=\"column\" class=\"wrapper\" layout-padding ng-if=\"reviewablesLoaded\">\n\n  <div flex ng-repeat=\"part in parts track by $index\"\n      ng-init=\"stepNumber = $index + 1\" class=\"animate-show\"\n      ng-show=\"progress.step == stepNumber\"\n  >\n    <ng-include src=\"part.tmpl\" >\n    </ng-include>\n  </div>\n\n</div>");
$templateCache.put("details/basics.html","<div ng-controller=\"details.basics\" layout=\"column\" class=\"basics\">\n  <div class=\"info-bar\">\n    <h1 flex class=\"md-title text-center heading\">Step {{stepNumber}} of {{parts.length}}</h1>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"reviewer.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          You are Reviewing:\n        </h2>\n\n        <md-radio-group ng-model=\"reviewer.slug\" ng-change=\"reviewer.show = false && reviewer.setModel()\">\n          <md-radio-button ng-repeat=\"opt in reviewer.options\" ng-value=\"opt.slug\" aria-label=\"opt.title\">\n            <span ng-class=\"{\'brand-color\': (opt.slug === reviewer.slug)}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"resident.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Resident is:\n        </h2>\n        \n        <md-radio-group ng-model=\"resident.slug\" ng-change=\"resident.show = false && resident.setModel()\">\n          <md-radio-button ng-repeat=\"opt in resident.options\" ng-value=\"opt.slug\" aria-label=\"opt.title\">\n            <span ng-class=\"{\'brand-color\': (opt.slug === resident.slug)}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"stayDuration.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Duration of your Stay:\n        </h2>\n\n        <p><span class=\"brand-color\">{{stayDuration.text}}</span></p>\n\n        <md-slider min=\"0\" max=\"37\" ng-model=\"stayDuration.monthsAgo\"\n          aria-label=\"Stay Duration\" ng-change=\"stayDuration.calculateText()\">\n        </md-slider>\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"stayDuration.show = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n  \n  <div flex class=\"animate-show\" ng-show=\"askRent && rent.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Rent: <span class=\"brand-color\">{{rent.text}}</span>\n        </h2>\n        <form ng-submit=\"rent.show = false\">\n          <md-input-container>\n            <input required type=\"number\" step=\"any\" name=\"rent\" ng-model=\"rent.val\" ng-change=\"rent.setText()\" aria-label=\"Rent\">\n          </md-input-container>\n          <md-button flex class=\"md-raised md-cornered md-primary brand-btn\">Done</md-button>\n        </form>\n      </md-card-content>\n    </md-card>\n  </div>\n</div>");
$templateCache.put("details/degreesOfFreedom.html","<div ng-controller=\"details.degreesOfFreedom\" layout=\"column\" class=\"cards\">\n  <h1 flex class=\"md-title text-center heading\">Step {{stepNumber}} of {{parts.length}}</h1>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"landlordResidence.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is the Landlord/Warden staying in the same House ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! landlordResidence.isVal(\'yes\')}\"\n            ng-click=\"landlordResidence.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! landlordResidence.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"landlordResidence.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"liveInAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Live-In Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! liveInAllowed.isVal(\'yes\')}\"\n            ng-click=\"liveInAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! liveInAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"liveInAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"drinkingAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Drinking Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! drinkingAllowed.isVal(\'yes\')}\"\n            ng-click=\"drinkingAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! drinkingAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"drinkingAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"cookingNonVegAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Cooking Non-Veg Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! cookingNonVegAllowed.isVal(\'yes\')}\"\n            ng-click=\"cookingNonVegAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! cookingNonVegAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"cookingNonVegAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"smokingAllowed.val\">\n    <md-card flex question-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Smoking Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! smokingAllowed.isVal(\'yes\')}\"\n            ng-click=\"smokingAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! smokingAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"smokingAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"partyingAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Partying Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! partyingAllowed.isVal(\'yes\')}\"\n            ng-click=\"partyingAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! partyingAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"partyingAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\" ng-hide=\"friendsComingOverAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Friends Coming Over Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! friendsComingOverAllowed.isVal(\'yes\')}\"\n            ng-click=\"friendsComingOverAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! friendsComingOverAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"friendsComingOverAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\"  ng-hide=\"familyComingOverAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Family Coming Over Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! familyComingOverAllowed.isVal(\'yes\')}\"\n            ng-click=\"familyComingOverAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! familyComingOverAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"familyComingOverAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\"  ng-hide=\"petsAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Are Pets Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! petsAllowed.isVal(\'yes\')}\"\n            ng-click=\"petsAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! petsAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"petsAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\"  ng-hide=\"comingLateNightAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Coming in Late-Night Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! comingLateNightAllowed.isVal(\'yes\')}\"\n            ng-click=\"comingLateNightAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! comingLateNightAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"comingLateNightAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex question-card class=\"animate-show\"  ng-hide=\"playingLoudMusicAllowed.val\">\n    <md-card>\n      <div class=\"question-wrapper\" layout=\"column\" layout-align=\"center center\" layout-padding>\n        <h2 class=\"md-display-1 white-color text-center\">\n          Is Playing Loud Music Allowed ?\n        </h2>\n      </div>\n      <md-card-content layout=\"row\" layout-align=\"center center\">\n        <div class=\"yes-btn\" ng-class=\"{\'grayscale\': ! playingLoudMusicAllowed.isVal(\'yes\')}\"\n            ng-click=\"playingLoudMusicAllowed.toggleVal(\'yes\')\"\n        >\n        </div>\n        <div class=\"no-btn\" ng-class=\"{\'grayscale\': ! playingLoudMusicAllowed.isVal(\'no\')}\" offset=\"20\"\n            ng-click=\"playingLoudMusicAllowed.toggleVal(\'no\')\"\n        >\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n</div>");
$templateCache.put("details/formalities.html","<div ng-controller=\"details.formalities\" layout=\"column\">\n  <h1 flex class=\"md-title text-center heading\">Step {{stepNumber}} of {{parts.length}}</h1>\n\n  <div flex class=\"animate-show\" ng-show=\"additionalRemarksChoice.show\">\n    <md-card flex>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Do You Have Any Additional Remarks ?\n        </h2>\n\n        <md-radio-group ng-model=\"additionalRemarksChoice.val\" ng-change=\"additionalRemarksChoice.show = false\">\n          <md-radio-button ng-repeat=\"opt in additionalRemarksChoice.options\" ng-value=\"opt.val\" aria-label=\"{{opt.title}}\">\n            <span ng-class=\"{\'brand-color\': opt.val === additionalRemarksChoice.val}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex ng-show=\"showAdditionalRemarks\" class=\"animate-show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Additional Remarks\n        </h2>\n        <form ng-submit=\"showAdditionalRemarks = false\">\n          <md-input-container>\n              <input ng-model=\"additionalRemarks.val\" type=\"text\" aria-label=\"Additional Remarks\" md-maxlength=\"150\">\n          </md-input-container>\n        </form>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex ng-show=\"showAddressForm\" class=\"animate-show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">Address</h2>\n        <md-input-container>\n          <label>Flat Number</label>\n          <input name=\"flat_number\" ng-model=\"address.data.flat_number\"\n            ng-keyup=\"address.focusOnEnter($event, \'locality\')\">\n        </md-input-container>\n\n        <md-input-container>\n          <label>Locality</label>\n          <input name=\"locality\" ng-model=\"address.data.locality\"\n            ng-keyup=\"address.focusOnEnter($event, \'city\')\">\n        </md-input-container>\n\n        <md-input-container>\n          <label>City</label>\n          <input name=\"city\" ng-model=\"address.data.city\"\n            ng-keyup=\"address.focusOnEnter($event, \'state\')\">\n        </md-input-container>\n\n        <md-input-container>\n          <label>State</label>\n          <input name=\"state\" ng-model=\"address.data.state\"\n            ng-keyup=\"address.focusOnEnter($event, \'pincode\')\">\n        </md-input-container>\n\n        <md-input-container>\n          <label>Pincode</label>\n          <input name=\"pincode\" ng-model=\"address.data.pincode\" ng-keyup=\"address.focusOnEnter($event, null)\">\n        </md-input-container>\n\n        <div flex layout=\"row\">\n          <md-button class=\"md-raised md-cornered md-primary\" aria-label=\"Next\" flex ng-click=\"nextStep()\">\n            Submit\n          </md-button>\n        </div>\n      </md-card-content>\n    </md-card>\n  </div>\n</div>");
$templateCache.put("details/livingConditions.html","<div ng-controller=\"details.livingConditions\" layout=\"column\">\n  <h1 flex class=\"md-title text-center heading\">Step {{stepNumber}} of {{parts.length}}</h1>\n\n  <div flex class=\"animate-show\" ng-show=\"waterProblemsExist.show\">\n    <md-card flex>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Are there any Water Problems\n        </h2>\n        \n        <md-radio-group ng-model=\"waterProblemsExist.val\" ng-change=\"waterProblemsExist.show = false && waterProblemsExist.setText()\">\n          <md-radio-button ng-repeat=\"opt in waterProblemsExist.options\" ng-value=\"opt.val\" aria-label=\"{{opt.title}}\">\n            <span ng-class=\"{\'brand-color\': opt.val === waterProblemsExist.val}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"waterProblems.show\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Water Problems:\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in waterProblems.options\">\n            <md-checkbox ng-checked=\"waterProblems.isItemListed(opt)\" ng-click=\"waterProblems.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': waterProblems.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"waterProblems.show = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"powerSupply.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          How is the Power Supply:\n        </h2>\n\n        <md-radio-group ng-model=\"powerSupply.val\" ng-change=\"powerSupply.show = false && powerSupply.setText()\">\n          <md-radio-button ng-repeat=\"opt in powerSupply.options\" ng-value=\"opt.val\" aria-label=\"{{opt.title}}\">\n            <span ng-class=\"{\'brand-color\': powerSupply.val === opt.val}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"livingProblems.show.first\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Living Problems (1/2):\n        </h2>\n\n        <fieldset flex layout=\"column\" layout-wrap>\n          <div flex ng-repeat=\"opt in livingProblems.options.first\">\n            <md-checkbox ng-checked=\"livingProblems.isItemListed(opt)\" ng-click=\"livingProblems.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': livingProblems.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"livingProblems.show.first = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"livingProblems.show.second\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Living Problems (2/2):\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in livingProblems.options.second\">\n            <md-checkbox ng-checked=\"livingProblems.isItemListed(opt)\" ng-click=\"livingProblems.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': livingProblems.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"livingProblems.show.second = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"facilities.show.first\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Facilities/Essentials (1/2):\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in facilities.options.first\">\n            <md-checkbox ng-checked=\"facilities.isItemListed(opt)\" ng-click=\"facilities.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': facilities.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"facilities.show.first = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"facilities.show.second\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Facilities/Essentials (2/2):\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in facilities.options.second\">\n            <md-checkbox ng-checked=\"facilities.isItemListed(opt)\" ng-click=\"facilities.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': facilities.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"facilities.show.second = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"landlordCharacteristics.show\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Landlord Is..\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in landlordCharacteristics.options\">\n            <md-checkbox ng-checked=\"landlordCharacteristics.isItemListed(opt)\"\n              ng-click=\"landlordCharacteristics.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': landlordCharacteristics.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"landlordCharacteristics.show = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"localityOverview.show.first\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Overview of Locality (1/2):\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in localityOverview.options.first\">\n            <md-checkbox ng-checked=\"localityOverview.isItemListed(opt)\" ng-click=\"localityOverview.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': localityOverview.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"localityOverview.show.first = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"localityOverview.show.second\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Overview of Locality (2/2):\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in localityOverview.options.second\">\n            <md-checkbox ng-checked=\"localityOverview.isItemListed(opt)\" ng-click=\"localityOverview.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': localityOverview.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"localityOverview.show.second = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"neighbours.show\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Are the Neighbours: \n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in neighbours.options\">\n            <md-checkbox ng-checked=\"neighbours.isItemListed(opt)\" ng-click=\"neighbours.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': localityOverview.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"neighbours.show = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n  <div flex class=\"animate-show\" ng-show=\"rentPayment.show\">\n    <md-card>\n      <md-card-content layout=\"column\">\n        <h2 flex class=\"md-title brand-color\">\n          Payment Methods:\n        </h2>\n\n        <fieldset flex layout=\"row\" layout-wrap>\n          <div flex ng-repeat=\"opt in rentPayment.options\">\n            <md-checkbox ng-checked=\"rentPayment.isItemListed(opt)\" ng-click=\"rentPayment.toggleItem(opt)\"\n              aria-label=\"{{opt.title}}\"\n            >\n              <span ng-class=\"{\'brand-color\': rentPayment.isItemListed(opt)}\">{{opt.title}}</span>\n            </md-checkbox>\n          </div>\n        </fieldset>\n\n        <md-button flex class=\"md-raised md-cornered md-primary brand-btn\" ng-click=\"rentPayment.show = false\">Done</md-button>\n      </md-card-content>\n    </md-card>\n  </div>\n</div>");
$templateCache.put("details/residence.html","<div ng-controller=\"details.residence\" layout=\"column\" class=\"cards\">\n  <h1 flex class=\"md-title text-center heading\">Step {{stepNumber}} of {{parts.length}}</h1>\n\n  <div flex class=\"animate-show\" ng-show=\"numPeople.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Number of Residents:\n        </h2>\n        \n        <md-radio-group ng-model=\"numPeople.val\" ng-change=\"numPeople.show = false && numPeople.setText()\">\n          <md-radio-button ng-repeat=\"opt in numPeople.options\" ng-value=\"opt.val\" aria-label=\"opt.title\">\n            <span ng-class=\"{\'brand-color\': opt.val === numPeople.val}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n\n      </md-card-content>\n    </md-card>\n  </div>\n  <div flex class=\"animate-show\" ng-show=\"flatType.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Type of Flat:\n        </h2>\n    \n        <md-radio-group ng-model=\"flatType.val\" ng-change=\"flatType.show = false && flatType.setText()\">\n          <md-radio-button ng-repeat=\"opt in flatType.options\" ng-value=\"opt.val\" aria-label=\"opt.title\">\n            <span ng-class=\"{\'brand-color\': opt.val === flatType.val}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n\n      </md-card-content>\n    </md-card>\n  </div>\n\n  <div flex class=\"animate-show\" ng-show=\"demography.show\">\n    <md-card>\n      <md-card-content>\n        <h2 class=\"md-title brand-color\">\n          Who Can Stay:\n        </h2>\n    \n        <md-radio-group ng-model=\"demography.val\" ng-change=\"demography.show = false && demography.setText()\">\n          <md-radio-button ng-repeat=\"opt in demography.options\" ng-value=\"opt.val\" aria-label=\"opt.title\">\n            <span ng-class=\"{\'brand-color\': opt.val === demography.val}\">{{opt.title}}</span>\n          </md-radio-button>\n        </md-radio-group>\n\n      </md-card-content>\n    </md-card>\n  </div>\n</div>");}]);
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
var app = angular.module('app');

app.controller('details.formalities', [
    '$scope',
    function ($scope) {
        $scope.additionalRemarksChoice = {
            val: null,
            show: true,
            options: [
                {val: 'yes', title: 'Yes'},
                {val: 'no', title: 'No'}
            ]
        };

        $scope.$watch('additionalRemarksChoice.val', function (newVal, oldVal) {
            $scope.showAdditionalRemarks = (newVal === 'yes');
        });

        $scope.showAdditionalRemarks = false;

        $scope.additionalRemarks = {
            val: null
        };

        $scope.showAddressForm = true;

        $scope.submit = function () {
            $scope.showAddressForm = false;
        };

        $scope.address = {
            show: true,
            data: {
                flat_number: null,
                locality   : null,
                city       : null,
                state      : null,
                pincode    : null
            },

            focusOnEnter: function (ev, next) {
                if (ev.keyCode === 13) {
                    var input = ev.srcElement;
                    var holder = input.parentElement.parentElement;

                    if (next) {
                        var nextInput = holder.querySelector('input[name="'+next+'"]');
                        nextInput.focus();
                    } else {
                        input.blur();
                    }
                }                
            }
        };

        $scope.nextStep = function () {
            if ($scope.additionalRemarksChoice.val === 'yes') {
                $scope.setData('remarks', $scope.additionalRemarks.val);
            }

            $scope.setData('address', $scope.address.data);

            $scope.moveToNextStep();
        };
    }
]);
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
var app = angular.module('app');

app.factory('api', [
    '$http',
    function ($http) {
        var apiBase = 'http://ec2-52-26-213-120.us-west-2.compute.amazonaws.com';

        var api = function (method, url, params) {
            params = params || {};
            params.method = method;
            params.url = apiBase + url;

            params.headers = params.headers || {};

            params.headers['Content-Type'] = 'application/json';

            return $http(params).then(function (res) {
                return res.data;
            });
        };

        ['GET', 'PUT', 'POST', 'DELETE'].forEach(function (method) {
            api[method.toLowerCase()] = api.bind(this, method);
        }.bind(this));

        return api;
    }
]);