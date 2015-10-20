var express = require('express'),
    router = express.Router(),
    ItemProvider = require('../itemprovider-mongodb').ItemProvider,
    itemProvider = new ItemProvider();
    itemProvider.open(function(){});

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', {
   title : 'suprsidr ninja'
  });
});

router.param('q', function(req, res, next, q) {
  req.params.q = checkParam(q);
  //console.log(req.params.q)
  next(); 
});

router.param('l', function(req, res, next, l) {
  req.params.l = parseInt(l) ? parseInt(l) : 0;
  //console.log(req.params.l)
  next(); 
});

router.param('s', function(req, res, next, s) {
  req.params.s = checkParam(s);
  //console.log(req.params.s)
  next(); 
});

router.param('f', function(req, res, next, f) {
  req.params.f = checkParam(f);
  //console.log(req.params.f)
  next(); 
});

router.get('/search/:q/:l?/:s?/:f?', function(req, res) {
  itemProvider.findItems({
    collection: 'products',
    query: req.params.q || {},
    limit: req.params.l,
    sort: req.params.s,
    fields: req.params.f || {}
  }, function(err, items) {
    if(err || items.length === 0) {
      //console.log(err)
      res.jsonp({"error": "Not Found"});
      res.end();
    } else {
      res.jsonp(items);
      res.end();
    }
  });
});

router.get('/list/', function(req, res) {
  itemProvider.findItems({collection: 'products'}, function(err, data) {
    res.jsonp(data);
    res.end();
  });
});

router.get('/pdf/:id?', function(req, res) {
  if(req.params.id === undefined) {
    res.download('/opt/mean/public/pdf/Spektrum_Surface_Tradeup_Redemption_Form.pdf', 'Spektrum_Surface_Tradeup_Redemption_Form.pdf');
  } else if(req.params.id.toLowerCase() === 'air'){
    res.download('/opt/mean/public/pdf/Spektrum_Air_Transmitter_Trade_Up_Form.pdf', 'Spektrum_Air_Transmitter_Trade_Up_Form.pdf');
  }
});

var checkParam=function(a){return void 0===a?{}:a.match(/^{/)?JSON.parse(a):objectify(a)};

var objectify=function(r){for(var t={},a=r.split(","),n=0;n<a.length;n++){var e=a[n].split(":");t[e[0]]=parseInt(e[1])?parseInt(e[1]):e[1]}return t};

module.exports = router;
