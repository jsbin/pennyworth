/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('Stylus', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid Stylus and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.styl', function (error, file) {
      requester.send({
        language: 'stylus',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.result.errors === null).should.be.true;
        res.result.result.should.exist;
        done();
      });
    });
  });

  it('Should process invalid Stylus and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.styl', function (error, file) {
      requester.send({
        language: 'stylus',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.result.result === null).should.be.true;
        res.result.errors.should.exist;
        done();
      });
    });
  });

  after(function () {
    requester.close();
    server.stop();
  });

});



