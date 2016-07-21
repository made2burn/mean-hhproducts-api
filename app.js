var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var routes = require('./routes/index');
var https_options = {
  SNICallback: function (domain) {
    return crypto.createCredentials({
      key:  fs.readFileSync('/path/to/domain.key'),
      cert: fs.readFileSync('/path/to/domain.crt'),
      ca: [
        fs.readFileSync('/path/to/CA_cert_1.crt'),
        fs.readFileSync('/path/to/CA_cert_2.crt')
      ]
    }).context;
  },
  cert: fs.readFileSync('/path/to/server.crt'),
  key: fs.readFileSync('/path/to/server.key'),
};

var app = express();

function ensureSecure(req, res, next){
  if(req.secure){
    // OK, continue
    return next();
  };
  res.redirect('https://'+req.hostname+req.url);
};

app.set("jsonp callback", true);

// uncomment after placing your favicon in /public
app.use(compress()); // must be first
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.all('*', ensureSecure);

app.use('/', routes); // our routes are in routes/index.js

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    var status = err.status || 500;
    res.status(status);
    if(status === 500) {
      res.end('500: Internal Server Error', 500)
    } else {
      res.end('404: Page not Found', 404);
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  var status = err.status || 500;
  res.status(status);
  if(status === 500) {
    res.end('500: Internal Server Error', 500)
  } else {
    res.end('404: Page not Found', 404);
  }

});

var debug = require('debug')('dbApp');

app.set('port', process.env.PORT || 443);
var insecureServer = http.createServer(app).listen(80)
var server = https.createServer(https_options, app).listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port);
});
