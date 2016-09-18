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
        console.log(result);
        $scope.modal.hide();
      });
  };
})

.controller('PlaylistsCtrl', function($scope) {
  var db = firebase.database();
  $scope.playlists;/* = [
    { title: 'Chequing', id: 1 },
    { title: 'Savings', id: 2 },
    { title: 'TFSA', id: 3 },
    { title: 'Bank Loan', id: 4 },
  ];*/
  $scope.item;
  $scope.getAccounts = function(){
    var ref = db.ref("users/facebook_id/account_list");
    ref.orderByChild("name").on("value", function(snapshot){
        snapshot.forEach(function(data){
            $scope.playlists[data.key] = data.val;
        });
    });
  }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});

.controller('UserInfo',function($scope) {
  var db = firebase.database();
  db.ref("users/"+$scope.uid+"/display_name").on("value").then(function(name){
    $scope.display_name = name.val();
  })


})
