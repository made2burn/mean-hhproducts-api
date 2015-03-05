var ItemProvider = require('./itemprovider-mongodb').ItemProvider,
    itemProvider = new ItemProvider(),
    merge = require('merge'),
    data = require('./hh2products').Products;

var i = 0, l = data.length;

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

itemProvider.open(function(){
  saveToDb();
});

