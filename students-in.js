/**
 * this script is run from commandline to insert HH.com product data into local MongoDB
 *
 */
var ItemProvider = require('./itemprovider-mongodb').ItemProvider,
    itemProvider = new ItemProvider(),
    merge = require('merge'),
    uuid = require('uuid'),
    data = require('./students').results;

var i = 0, l = data.length, date = Date.now();

var majors = ["Agriculture","Agriculture Operations","Architecture","Area","Ethnic","Cultural","Gender","Aviation","Biological and Biomedical Sciences","Business","Management","Marketing","Communication","Journalism","Communications Technologies","Computer and Information Sciences","Construction Trades","Education","Engineering Technologies","Engineering","English Language","Family and Consumer Sciences","Foreign Languages","Literatures","Health Professions","History","Homeland Security","Law Enforcement","Firefighting","Human Services","Legal Professions","Liberal Arts","Humanities","Library Science","Mathematics and Statistics","Mechanic and Repair Technologies","Military Technologies and Applied Sciences","Multi/interdisciplinary Studies","Natural Resources and Conservation","Parks"," Recreation"," Leisure and Fitness Studies","Personal and Culinary Services","Philosophy and Religious Studies","Physical Sciences","Precision Production","Psychology","Science Technologies","Social Sciences","Theology and Religious Vocations","Transportation and Materials Moving","Visual and Performing Arts"];
function getRandomFloatInclusive(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// iterate over our product data and insert into MongoDB
function saveToDb() {
  data[i].sid = uuid.v4();
  data[i].gpa = getRandomFloatInclusive(2.5, 4.0).toFixed(1);
  data[i].major = majors[getRandomIntInclusive(0, majors.length - 1)];
  data[i].modified = date;
  data[i].modifiedby = 'Wayne Patterson';
  itemProvider.findOne({collection: 'students', query: {sid: data[i].sid}}, function(err, item) {
    if(err){
      console.log(err);
      return i<data.length-1?(i++,void saveToDb()):void process.exit();
    }
    if(item === null) {
      itemProvider.save({collection: 'students'}, data[i], function(err, obj) {
        if(err) console.log(err, data[i]);
        console.log('saved: ' + data[i].sid, i + '/' + l);
        return i<data.length-1?(i++,void saveToDb()):void process.exit();
      });
    } else {
      // document exists, lets update it.
      var merged = merge.recursive(true, item, data[i]);
      delete merged._id;
      itemProvider.updateItem(
        {
          collection: 'students',
          query: {
            sid: data[i].sid
          },
          action: {
            '$set' : merged
          }
        }, function(err, obj) {
        if(err) console.log(err, data[i]);
        console.log('updated: ' + data[i].sid, i + '/' + l);
        return i<data.length-1?(i++,void saveToDb()):void process.exit();
      });
    }
  });
}

// open DB -> insert items into DB
itemProvider.open(function(){
  itemProvider.getCollection('students', function(err, collection) {
    if(err) {
      console.log(err);
      return;
    }
    collection.createIndex( { sid: 1 } )
    saveToDb();
  });
});
