/* global describe, it, after, before */
'use strict';

var fs = require('fs');
var assert = require('assert');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('myth', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process unprefixed CSS and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.css', function (error, file) {
      requester.send({
        language: 'myth',
        source: file.toString()
      }, function (res) {
        assert(res.error === null, 'error is null: ' + res.error);
        assert(!!res.result.result, 'result: ' + res.result.result);
        done();
      });
    });
  });

  it('Should process invalid CSS and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.css', function (error, file) {
      requester.send({
        language: 'myth',
        source: file.toString()
      }, function (res) {
        assert(res.error === null, 'error is null: ' + res.error);
        assert(!!res.result.errors, 'result: ' + res.result.errors);
        done();
      });
    });
  });

  after(function () {
    requester.close();
    server.stop();
  });

});


