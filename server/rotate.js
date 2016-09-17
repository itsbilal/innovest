"use strict";

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "../service_account_creds.json",
  databaseURL: "https://innovest-393d6.firebaseio.com"
});

var db = firebase.database();

// Rotator 1: Adds income

var incomeRotator = function(user) {
  var income = parseFloat(user.child("income").val());
  var balance = parseFloat(user.child("balance").val()) + income;

  return user.ref.child("balance").set(balance)
    .then((result) => {
      return user.ref.once("value");
    });
};

var investmentFiller = require("./investmentFiller")(firebase);
var investmentRotator = require("./investments")(firebase);

var rotators = [
  incomeRotator,
  investmentRotator,
  ];

investmentFiller.then(() => {
    return db.ref("/users/").once("value");
  })
  .then((users) => {
    var userPromises = [];
    users.forEach((user) => {
      // Send the user through a chain of rotators
      var promise = Promise.resolve(user);

      for (let rotator of rotators) {
        promise = promise.then(rotator);
      }

      userPromises.push(promise);
    });

    return Promise.all(userPromises);
  })
  .then((users) => {
    console.log("Rotated successfully");
    process.exit();
  })
  .catch((error) => {
    console.error(error);
  });
