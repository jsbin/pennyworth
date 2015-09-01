/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('ClojureScript', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid ClojureScript and pass back evaluated value', function (done) {
    fs.readFile(__dirname + '/sample.js', function (error, file) {
      requester.send({
        language: 'clojurescript',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.output.errors === null).should.be.true;
        res.output.result.should.exist;
        done();
      });
    });
  });

  it('Should process invalid ClojureScript and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.js', function (error, file) {
      requester.send({
        language: 'clojurescript',
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
