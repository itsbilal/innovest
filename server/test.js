var request = require("request");
  var parse = require("csv-parse");

new Promise((resolve, reject) => {
      request("http://download.finance.yahoo.com/d/quotes.csv?s=AAPL+GOOG+MSFT+AMZN+%5EGSPC+%5EGSPTSE+XBB.TO&f=snl1", (err, response, data) => {
        parse(data, {delimeter: ','}, (err, records) => {
          resolve(records);
        });
      });
    }).then((records) => {
      console.log(records);
    }).catch((error)=> {
      console.error(error);
    });
