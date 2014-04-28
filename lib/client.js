'use strict';

var express = require('express');
var path = require('path');
var app = express();
var cors = require('./cors');
var zmq = require('zmq');
var Promise = require('rsvp').Promise;
var bodyParser = require('body-parser');
var requesters = [];

function request(data) {
  return new Promise(function (resolve, reject) {
    var requester = zmq.socket('req');
    requesters.push(requester);
    requester.on('message', function (raw) {
      var i = requesters.indexOf(requester);
      if (i !== -1) {
        requesters.splice(i, 1);
      }
      requester.close();
      var data = JSON.parse(raw);
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    });
    requester.connect('tcp://localhost:5555');
    requester.send(JSON.stringify(data));
  });
}

app.use(bodyParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cors('jsbin.dev'));
app.post('/', function (req, res) {
  console.log('post in ' + (req.body || {}).language);
  request(req.body).then(function (data) {
    res.send(data);
  }).catch(function (error) {
    res.send(500, error);
  });
});
app.listen(process.env.PORT || '8000');

process.on('SIGINT', function() {
  requesters.forEach(function (r) {
    r.close();
  });
  process.exit();
});