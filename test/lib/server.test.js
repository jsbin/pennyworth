/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../lib/server');

describe('Server', function () {

  before(function () {
    server.start();
    requester.connect('tcp://0.0.0.0:5555');
  });

  it('Should error if compilation time exceeds 10 seconds', function (done) {
    fs.readFile(__dirname + '/infinite.sass', function (error, file) {
      requester.send({
        language: 'sass',
        source: file.toString()
      }, function (res) {
        (res.error === null).should.not.be.true;
        done();
      });
    });
  });

  after(function () {
    requester.close();
    server.stop();
  });

});
