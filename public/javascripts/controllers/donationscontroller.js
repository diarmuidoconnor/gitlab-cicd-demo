var app = angular.module('DonationWebApp');

app.controller('donationsController', ['$scope', function($scope) {
    // create a message to display in our view
    $scope.message = 'Donations Page!';

  }
  ]);
