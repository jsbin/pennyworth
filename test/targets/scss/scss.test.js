/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

describe('SCSS with Compass', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid SCSS without errors', function (done) {
    fs.readFile(__dirname + '/sample.scss', function (error, file) {
      requester.send({
        language: 'scss',
        source: file.toString(),
        url: '_sample',
        revision: '_',
      }, function (res) {
        (res.error === null).should.be.true;
        res.result.result.should.exist;
        fs.unlink(__dirname + '/../../../targets/scss/output/sass/_sample._.scss');
        fs.unlink(__dirname + '/../../../targets/scss/output/stylesheets/_sample._.css');
        done();
      });
    });
  });

  it('Should process invalid SCSS and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.scss', function (error, file) {
      requester.send({
        language: 'scss',
        source: file.toString(),
        url: '_broken',
        revision: '_',
      }, function (res) {
        // even in the error case we should get a res.error === null because the
        // scss output error is sent in the result.errors
        (res.error === null).should.be.true;
        res.result.errors.should.exist;
        fs.unlink(__dirname + '/../../../targets/scss/output/sass/_broken._.scss');
        fs.unlink(__dirname + '/../../../targets/scss/output/stylesheets/_broken._.css');
        done();
      });
    });
  });

  after(function () {
    requester.close();
    server.stop();
  });

});
