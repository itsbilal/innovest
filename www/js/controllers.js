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

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    firebase.auth().signInWithPopup(provider)
      .then(function(result) {
        $scope.uid = result.user.uid;
        $scope.modal.hide();
      });
  };
})

.controller('PlaylistsCtrl', function($scope) {
  var db = firebase.database();
  $scope.accounts = [];/* = [
    { title: 'Chequing', id: 1 },
    { title: 'Savings', id: 2 },
    { title: 'TFSA', id: 3 },
    { title: 'Bank Loan', id: 4 },
  ];*/
  var getAccounts = function(){
    var ref = db.ref("users/" + $scope.uid + "/account_list");
    ref.orderByChild("name").on("value", function(snapshot){
      snapshot.forEach(function(data){
        var account = data.val();
        account.name = data.key
        $scope.accounts.push(account);
      });
    });
  }
  
  $scope.$watch('uid', getAccounts, true);
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
