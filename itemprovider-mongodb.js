/**
 * @author wpatterson
 */
var C = require('./config.js');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var ItemProvider = function() {};

// Open connection to DB server
ItemProvider.prototype.open = function(cb) {
  this.db = new Db(C.db.name, new Server(C.db.host, C.db.port, {auto_reconnect: true}), {safe: true});
  this.db.open(function(){
    cb();
  });
};

// General get collection
ItemProvider.prototype.getCollection = function(collection, callback) {
  this.db.collection(collection, function(err, collection) {
    if (err) {
      callback(err);
    } else {
      callback(null, collection);
    }
  });
};

// find items in collection
ItemProvider.prototype.findItems = function(o, callback) {
    this.getCollection(o.collection || 'items', function(error, collection) {
      if( error ) {
        callback(error);
      } else {
        collection.find(o.query, o.fields).sort(o.sort || {_id: -1}).limit(o.limit || 0).toArray(function(error, results) {
          if( error ) {
            callback(error);
          } else {
            callback(null, results);
          }
        });
      }
    });
};

// find single item
ItemProvider.prototype.findOne = function(o, callback) {
    this.getCollection(o.collection || 'items', function(error, collection) {
      if( error ) {
        callback(error);
      } else {
        collection.findOne(o.query, function(error, result) {
          if( error ) {
            callback(error);
          } else {
            callback(null, result);
          }
        });
      }
    });
};

// save item or items
ItemProvider.prototype.save = function(o, items, callback) {
    this.getCollection(o.collection || 'items', function(error, collection) {
      if( error ) callback(error)
      else {
        if( typeof(items.length)=="undefined") {
          items = [items];
        }
        /*for( var i =0;i< items.length;i++ ) {
          item = items[i];
          item.ratings = {};
          item.created_at = new Date();
        }*/
        collection.insert(items, function() {
          callback(null, items);
        });
      }
    });
};

// update item or items
ItemProvider.prototype.updateItem = function(o, callback) {
  this.getCollection(o.collection || 'items', function(error, collection) {
    if( error ) {
      callback( error );
    } else {
      collection.update(
        o.query,
        o.action,
        function(error, result){
          if( error ) {
            callback(error);
          } else {
            callback(null, result);
          }
        }
      );
    }
  });
};

// delete item or items
ItemProvider.prototype.deleteItem = function(o, callback) {
  this.getCollection(o.collection || 'items', function(error, collection) {
    if( error ) callback( error );
    else {
      collection.remove(
        o.query,
        true,
        function(error, result){
          if( error ) {
            callback(error);
          } else {
            callback(null, result);
          }
        }
      );
    }
  });
};

exports.ItemProvider = ItemProvider;