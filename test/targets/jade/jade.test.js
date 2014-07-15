/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('Jade', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid Jade and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.jade', function (error, file) {
      requester.send({
        language: 'jade',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.output.errors === null).should.be.true;
        res.output.result.should.exist;
        done();
      });
    });
  });

  it('Should process invalid Jade and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.jade', function (error, file) {
      requester.send({
        language: 'jade',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.output.result === null).should.be.true;
        res.output.errors.should.exist;
        done();
      });
    });
  });

  after(function () {
    requester.close();
    server.stop();
  });

});


