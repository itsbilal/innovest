"use strict";

module.exports = function(firebase){
  var db = firebase.database();

  var request = require("request");
  var parse = require("csv-parse");
  
  return function(user) {
    return db.ref("/markets").once("value")
    .then((markets) => {
      var promises = [];
      
      markets.forEach((stock) => {
        if (stock.hasChild("change")) {
          var factor = (parseFloat(stock.child("change").val())*3.5) + 1;
          promises.push(user.ref.child("investments/" + stock.key + "/value").once("value")
            .then((investment) => {
              if (investment.val()) {
                return investment.ref.set(parseFloat(investment.val())*factor);
              }
              return Promise.resolve(0);
            }));
        }
      });

      return Promise.all(promises);
    })
    .then(() => {
      return user.ref.once("value");
    });
  };
};
