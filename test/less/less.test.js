/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

describe('Less', function () {

  before(function () {
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid Less and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.less', function (error, file) {
      requester.send({
        language: 'less',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        done();
      });
    });
  });

  it('Should process invalid Less and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.less', function (error, file) {
      requester.send({
        language: 'less',
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


