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