angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  var provider = new firebase.auth.FacebookAuthProvider();

  // Form data for the login modal
  $scope.loginData = {};

  $scope.selectedAccount = null;
  $scope.accounts = [];

  // Header image at the top of every page
  $scope.logoTitle = "<img src=\"img/innovest.png\">";

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  var bootstrapUser = function(user) {
    var db = firebase.database();

    var default_user = {
      "income": 770.00,
      "balance": 5000.00,
      "investments": {
        "AAPL": {
          "value": 519.00
        }
      },
      "account_list": {      
        "chequing":{
          "balance": 2400.00,
          "balance_change": -300.00
        },
        "TFSA":{
          "balance": 130.00,
          "balance_change": 25.00
        }
      }
    };

    db.ref("/users/" + user.uid).on("value", function(userSnapshot) {
      var account_list = [];
      if (userSnapshot.hasChildren()) {
        $scope.user = userSnapshot.val();
        delete $scope.user['account_list'];

        account_list = userSnapshot.child("account_list");
      } else {
        default_user.display_name = user.displayName;
        userSnapshot.ref.set(default_user);
        account_list = default_user.account_list;
      }

      account_list.forEach(function(accountSnapshot){
        var account = accountSnapshot.val();
        account.name = accountSnapshot.key
        $scope.accounts.push(account);
      });

      $scope.$apply();
    });
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    firebase.auth().signInWithPopup(provider)
      .then(function(result) {
        bootstrapUser(result.user);
        $scope.uid = result.user.uid;
        $scope.modal.hide();
      });
  };
})

.controller('AccountsCtrl', function($scope) {
  
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('DashboardCtrl',function($scope) {
  var db = firebase.database();
  db.ref("users/"+$scope.uid+"/display_name").on("value").then(function(name){
    $scope.display_name = name.val();
  })




})
