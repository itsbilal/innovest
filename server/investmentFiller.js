
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
              difference = records[stock.key].price - stock.price;
              promises.push(stock.ref.set({
                price: records[stock.key].price,
                change: (difference/stock.price)
              }));
            });

            return Promise.all(promises);
          }
        });
    })
    .catch((error)=> {
      console.error(error);
    });
};
