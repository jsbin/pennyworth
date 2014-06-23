/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

describe('Sass with Compass', function () {

  before(function () {
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid Sass without errors', function (done) {
    fs.readFile(__dirname + '/sample.sass', function (error, file) {
      requester.send({
        language: 'sass',
        source: file.toString(),
        url: '_sample',
        revision: '_',
      }, function (res) {
        (res.error === null).should.be.true;
        res.result.result.should.exist;
        fs.unlink(__dirname + '/../../../targets/sass/output/sass/_sample._.sass');
        fs.unlink(__dirname + '/../../../targets/sass/output/stylesheets/_sample._.css');
        done();
      });
    });
  });

  it('Should process invalid Sass and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.sass', function (error, file) {
      requester.send({
        language: 'sass',
        source: file.toString(),
        url: '_broken',
        revision: '_',
      }, function (res) {
        // even in the error case we should get a res.error === null because the
        // sass output error is sent in the result.errors
        (res.error === null).should.be.true;
        res.result.errors.should.exist;
        fs.unlink(__dirname + '/../../../targets/sass/output/sass/_broken._.sass');
        fs.unlink(__dirname + '/../../../targets/sass/output/stylesheets/_broken._.css');
        done();
      });
    });
  });

  after(function () {
    requester.close();
  });

});
