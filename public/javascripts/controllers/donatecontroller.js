var app = angular.module('DonationWebApp');

app.controller('donateController', ['$scope', function($scope) {
    
    $scope.formData = {};

    $scope.message = 'Donate Page!';
    $scope.amount = 1000;
    $scope.options = [{ name: "PayPal", id: 0 }, { name: "Direct", id: 1 }];
    $scope.formData.paymentOptions = $scope.options[0];
    $scope.formData.amount = $scope.amount = 1000;

  }

  ]);
