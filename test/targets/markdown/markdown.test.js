/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

describe('Markdown', function () {

  before(function () {
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid Markdown and pass back the compiled source', function (done) {
    fs.readFile(__dirname + '/sample.md', function (error, file) {
      requester.send({
        language: 'markdown',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        res.result.should.exist;
        done();
      });
    });
  });

  it('Should process invalid Markdown and *not* give back an error', function (done) {
    fs.readFile(__dirname + '/broken.md', function (error, file) {
      requester.send({
        language: 'markdown',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.be.true;
        done();
      });
    });
  });

  after(function () {
    requester.close();
  });

});


