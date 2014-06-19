/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

describe('Jade', function () {

  before(function () {
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid Jade and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.jade', function (error, file) {
      requester.send({
        language: 'jade',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        res.result.should.exist;
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
        res.error.should.exist;
        done();
      });
    });
  });

  after(function () {
    requester.close();
  });

});


