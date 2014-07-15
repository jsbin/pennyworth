/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('Coffeescript', function () {

  before(function () {
    server.start();
    requester.connect('tcp://0.0.0.0:5555');
  });

  it('Should process valid CoffeeScript and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.coffee', function (error, file) {
      requester.send({
        language: 'coffeescript',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.output.errors === null).should.be.true;
        res.output.result.should.exist;
        done();
      });
    });
  });

  it('Should process invalid CoffeeScript and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.coffee', function (error, file) {
      requester.send({
        language: 'coffeescript',
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

