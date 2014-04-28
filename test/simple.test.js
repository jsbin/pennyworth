'use strict';
/*global describe, it, after, before */
var zmq = require('zmq');
var assert = require('assert');
var requester = zmq.socket('req');

describe('simple message tests', function () {
  after(function () {
    requester.close();
  });

  before(function () {
    requester.connect('tcp://localhost:5555');
  });

  it('should process markdown', function (done) {
    requester.connect('tcp://localhost:5555');
    requester.once('message', function (reply) {
      var data = JSON.parse(reply);
      assert(data.result.indexOf('<h1>Heading 1</h1>') !== -1, data.data);
      done();
    });

    requester.send(JSON.stringify({ language: 'markdown', source: '# Heading 1\n\nThis *is* a processor.' }));
  });

  it('should process scss', function (done) {
    requester.once('message', function (reply) {
      var data = JSON.parse(reply);
      assert(data.result.indexOf('#main p .redbox') !== -1, data.data);
      done();
    });

    requester.send(JSON.stringify({ language: 'scss', source: '// Nested Rules\n\n#main p {\n color: #00ff00;\n width: 97%;\n \n .redbox {\n background-color: #ff0000;\n color: #000000;\n }\n }' }));
  });

  it('should handle errored scss', function (done) {
    requester.once('message', function (reply) {
      var data = JSON.parse(reply);
      console.log(data);
      assert(data.result.indexOf('#main p .redbox') !== -1, data.data);
      done();
    });

    requester.send(JSON.stringify({ language: 'scss', source: 'foobar' }));
  });

});