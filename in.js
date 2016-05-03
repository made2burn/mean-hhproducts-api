/**
 * this script is run from commandline to insert HH.com product data into local MongoDB
 * 
 */
var ItemProvider = require('./itemprovider-mongodb').ItemProvider,
    itemProvider = new ItemProvider(),
    merge = require('merge'),
    data = require('./hh2products').Products; // this file is uploaded to the server from the API updater script and contains all product data

var i = 0, l = data.length;

// iterate over our product data and insert into MongoDB
function saveToDb() {
  itemProvider.findOne({collection: 'products', query: {ProdID: data[i].ProdID}}, function(err, item) {
    if(err){
      console.log(err);
      return i<data.length-1?(i++,void saveToDb()):void process.exit();
    }
    if(item === null) {
      itemProvider.save({collection: 'products'}, data[i], function(err, obj) {
        if(err) console.log(err, data[i]);
        console.log('saved: ' + data[i].ProdID, i + '/' + l);
        return i<data.length-1?(i++,void saveToDb()):void process.exit();
      });
    } else {
      // document exists, lets update it.
      var merged = merge.recursive(true, item, data[i]);
      delete merged._id;
      itemProvider.updateItem(
        {
          collection: 'products',
          query: {
            ProdID: data[i].ProdID
          },
          action: {
            '$set' : merged
          }
        }, function(err, obj) {
        if(err) console.log(err, data[i]);
        console.log('updated: ' + data[i].ProdID, i + '/' + l);
        return i<data.length-1?(i++,void saveToDb()):void process.exit();
      });
    }
  });
}

// open DB -> insert items into DB
itemProvider.open(function(){
  saveToDb();
});

