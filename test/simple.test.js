'use strict';

var zmq = require('zmq');

// socket to talk to server
console.log('Connecting to processor server');
var requester = zmq.socket('req');

var x = 0;
requester.on('message', function (reply) {
  console.log('Received reply', x, ': [', reply.toString(), ']');
  x += 1;
  if (x === 10) {
    requester.close();
    process.exit(0);
  }
});

requester.connect('tcp://localhost:5555');

console.log('Sending request…');
requester.send(JSON.stringify({ language: 'markdown', source: '# Heading 1\n\nThis *is* a processor.' }));

process.on('SIGINT', function() {
  requester.close();
});