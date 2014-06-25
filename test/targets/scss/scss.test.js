/* global describe, it, after, before */
'use strict';

var fs = require('fs');
var Promise = require('rsvp').Promise;

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

var language = 'scss';
var ext = '.' + language;
var sample = 'sample';
var broken = 'broken';
var imp = 'import';
var output = '/../../../targets/' + language + '/output/';

describe('SCSS with Compass', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid SCSS without errors', function (done) {
    var fileName = sample;
    var check = 'result';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        (res.error === null).should.be.true;
        res.result[check].should.exist;
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        done();
      });
    });
  });

  it('Should process invalid SCSS and give back an error', function (done) {
    var fileName = broken;
    var check = 'errors';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        // even in the error case we should get a res.error === null because the
        // scss output error is sent in the result.errors
        (res.error === null).should.be.true;
        res.result[check].should.exist;
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        done();
      });
    });
  });

  it('Should process valid @import of a bin without errors', function (done) {
    var fileName = sample + '_' + imp;
    var check = 'result';
    var p = new Promise(function (resolve, reject) {
      fs.readFile(__dirname + '/' + imp + ext, function (error, file) {
        requester.send({
          language: language,
          source: file.toString(),
          url: '_' + imp,
          revision: '1'
        }, function(res) {
          // done();
          if (res.error === null && res.result.result !== null) {
            resolve();
          } else {
            (res.error === null).should.be.true;
            res.result[check].should.exist;
            done();
          }
        });
      });
    }).then(function () {
      fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
        requester.send({
          language: language,
          source: file.toString(),
          url: '_' + fileName,
          revision: '_'
        }, function(res) {
          (res.error === null).should.be.true;
          res.result[check].should.exist;
          done();
        });
      });
    });
  });

  it('Should import Bourbon without errors', function (done) {
    var fileName = sample + '_bourbon';
    var check = 'result';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        (res.error === null).should.be.true;
        res.result[check].should.exist;
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        done();
      });
    });
  });

  after(function () {
    requester.close();
    server.stop();
  });

});
