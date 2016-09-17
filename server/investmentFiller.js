"use strict";

module.exports = function(firebase){
  var db = firebase.database();

  var request = require("request");
  var parse = require("csv-parse");
  
  return new Promise((resolve, reject) => {
      request("http://download.finance.yahoo.com/d/quotes.csv?s=AAPL+GOOG+MSFT+AMZN+%5EGSPC+%5EGSPTSE+XBB.TO&f=snl1", (err, response, data) => {
        if (err) {
          reject(err);
          return;
        }

        parse(data, {delimeter: ','}, (err, records) => {
          if (err) {
            reject(err);
            return;
          }
          
          resolve(records);
        });
      });
    })
    .then((records) => {
      // Process records
      var results = {}

      for (let record of records) {
        record[0] = record[0].replace(".","");
        results[record[0]] = {
          price: record[2]
        };
      }

      return Promise.resolve(results);
    })
    .then((records) => {
      return db.ref("/markets").once("value")
        .then((oldValues) => {
          if (!oldValues.hasChildren()) {
            return oldValues.ref.set(records);
          } else {
            var promises = [];
            oldValues.forEach((stock) => {
              var difference = records[stock.key].price - stock.child('price').val();
              promises.push(stock.ref.set({
                price: records[stock.key].price,
                change: (difference/stock.child('price').val())
              }));
            });

            return Promise.all(promises);
          }
        });
    });
};
