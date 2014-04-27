'use strict';

var zmq = require('zmq');
var fs = require('fs');

// socket to talk to server
console.log('Connecting to processor server');
var requester = zmq.socket('req');

var x = 0;
requester.on('message', function (reply) {
  console.log('Received reply', x, ': [', reply.toString(), ']');
  requester.close();
  process.exit(0);
});

requester.connect('tcp://localhost:5555');

console.log('Sending request...');
fs.readFile('./sample.scss', 'utf8', function (error, source) {
  requester.send(JSON.stringify({ language: 'sass-with-compass', source: source, url: 'abc', revision: 12 }));
});

process.on('SIGINT', function() {
  requester.close();
});