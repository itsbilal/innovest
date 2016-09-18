angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state) {

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

  $scope.transferValue = 0;

  $scope.performTransfer = function(){
      $scope.selectedAccount.balance = $scope.selectedAccount.balance + $scope.transferValue;
      $scope.selectedAccount.balance_change = $scope.selectedAccount.balance_change + $scope.transferValue;
      $scope.saveUser();
  };

  var bootstrapUser = function(user) {
    var db = firebase.database();

    var default_user = {
      "income": 770.00,
      "balance": 5000.00,
      "expenses": 200.00,
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

  if (localStorage.getItem('uid')) {
    $scope.uid = localStorage.getItem('uid');
    bootstrapUser({uid: localStorage.getItem('uid')});
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    firebase.auth().signInWithPopup(provider)
      .then(function(result) {
        bootstrapUser(result.user);
        $scope.uid = result.user.uid;
        localStorage.setItem('uid', $scope.uid);
        $scope.modal.hide();

        $scope.$apply();
      });
  };

  $scope.saveUser = function() {
    if ($scope.uid) {
      var db = firebase.database();

      var account_list = {};
      
      $scope.accounts.forEach(function(account) {
        account_list[account.name] = account;
      });

      $scope.user.account_list = account_list;

      db.ref('/users/' + $scope.uid).set($scope.user);
    }
  }

  $scope.$watch('selectedAccount', function(){
    if ($scope.selectedAccount) {
      // Changed to a non-null value
      $state.go('app.single', {playlistId: $scope.selectedAccount.name});
    }
  }, true);

  $scope.$watch('accounts', function(){

    if ($scope.accounts.length > 0) {
      $scope.cash_balance = 0;
      $scope.accounts.forEach(function(account) {
        $scope.cash_balance += parseFloat(account.balance);
      });
    }
  }, true);
})

.controller('AccountsCtrl', function($scope) {
  
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
  
})

.controller('DashboardCtrl',function($scope) {



})

.controller('RealEstateListCtrl', function($scope, $state) {
  $scope.buyHouse = function(price){
    $state.go('app.buy', {price: price});
  }
})

.controller('RealEstatePurchaseCtrl', function($scope, $stateParams, $state) {
  $scope.price = parseFloat($stateParams.price);
  $scope.minimum_balance_needed = 0.05*$scope.price;
  $scope.can_purchase = $scope.minimum_balance_needed <= $scope.cash_balance;
  $scope.loaned_amount = $scope.price - ($scope.cash_balance);
  $scope.weekly_payment = (0.05122*$scope.loaned_amount)/52;

  $scope.purchase = function() {
    $scope.$parent.user.expenses += $scope.weekly_payment;
    $scope.$parent.accounts[0].balance -= $scope.price;
    $scope.$parent.user.propertyValue = ($scope.$parent.user.propertyValue || 0) + $scope.price;

    $scope.$parent.saveUser();

    $state.go('app.dashboard');
  };
})
