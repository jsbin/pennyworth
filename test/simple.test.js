'use strict';
/*global describe, it, after */
var zmq = require('zmq');
var assert = require('assert');
var requester = zmq.socket('req');

describe('simple message tests', function () {
  after(function () {
    requester.close();
  });

  it('should process markdown', function (done) {
    requester.connect('tcp://localhost:5555');
    requester.on('message', function (reply) {
      var data = JSON.parse(reply);
      assert(data.result.indexOf('<h1>Heading 1</h1>') !== -1, data.data);
      done();
    });

    requester.send(JSON.stringify({ language: 'markdown', source: '# Heading 1\n\nThis *is* a processor.' }));
  });
});