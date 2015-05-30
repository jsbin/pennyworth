/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('Babel', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid ES6 and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.js', function (error, file) {
      requester.send({
        language: 'babel',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        (res.output.errors === null).should.be.true;
        res.output.result.should.exist;
        done();
      });
    });
  });

  it('Should process invalid ES6 and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.js', function (error, file) {
      requester.send({
        language: 'babel',
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


