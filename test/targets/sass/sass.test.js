/* global describe, it, after, before, __dirname, require */
'use strict';

var fs = require('fs');
var Promise = require('rsvp').Promise;

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var server = require('../../../lib/server');

var language = 'sass';
var ext = '.' + language;
var sample = 'sample';
var broken = 'broken';
var imp = 'import';
var output = '/../../../targets/' + language + '/output/';

describe('Sass with Compass', function () {

  before(function () {
    server.start();
    requester.connect('tcp://localhost:5555');
  });


  // Plain
  it('Should process valid Sass without errors', function (done) {
    var fileName = sample;
    var check = 'result';
    var ncheck = 'errors';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        (res.error === null).should.be.true;
        res.output[check].should.exist;
        (res.output[ncheck] === null).should.be.true;
        done();
      });
    });
  });

  it('Should process invalid Sass and give back an error', function (done) {
    var fileName = broken;
    var check = 'errors';
    var ncheck = 'result';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        (res.error === null).should.be.true;
        res.output[check].should.exist;
        (res.output[ncheck] === null).should.be.true;
        done();
      });
    });
  });


  // @import bin
  it('Should process valid @import of a bin without errors', function (done) {
    var fileName = sample + '_' + imp;
    var check = 'result';
    var ncheck = 'errors';
    var p = new Promise(function (resolve, reject) {
      fs.readFile(__dirname + '/' + imp + ext, function (error, file) {
        requester.send({
          language: language,
          source: file.toString(),
          url: '_' + imp,
          revision: '1'
        }, function(res) {
          if (res.error === null && res.output.result !== null) {
            resolve();
          } else {
            fs.unlink(__dirname + output + 'sass/_' + imp + '.1' + ext);
            fs.unlink(__dirname + output + 'stylesheets/_' + imp + '.1.css');
            (res.error === null).should.be.true;
            res.output[ncheck].should.exist;
            (res.output[check] === null).should.be.true;
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
          fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
          fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
          fs.unlink(__dirname + output + 'sass/_' + imp + '.1' + ext);
          fs.unlink(__dirname + output + 'stylesheets/_' + imp + '.1.css');
          (res.error === null).should.be.true;
          res.output[check].should.exist;
          (res.output[ncheck] === null).should.be.true;
          done();
        });
      });
    });
  });

  it('Should process invalid @import of a bin and give back an error', function (done) {
    var fileName = broken + '_' + imp;
    var check = 'errors';
    var ncheck = 'result';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function(res) {
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        (res.error === null).should.be.true;
        res.output[check].should.exist;
        (res.output[ncheck] === null).should.be.true;
        done();
      });
    });
  });


  // Bourbon
  it('Should import Bourbon without errors', function (done) {
    var fileName = sample + '_bourbon';
    var check = 'result';
    var ncheck = 'errors';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        (res.error === null).should.be.true;
        res.output[check].should.exist;
        (res.output[ncheck] === null).should.be.true;
        done();
      });
    });
  });

  it('Should fail importing Bourbon and give back an error', function (done) {
    var fileName = broken + '_bourbon';
    var check = 'errors';
    var ncheck = 'result';
    fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
      requester.send({
        language: language,
        source: file.toString(),
        url: '_' + fileName,
        revision: '_'
      }, function (res) {
        fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
        fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
        (res.error === null).should.be.true;
        res.output[check].should.exist;
        (res.output[ncheck] === null).should.be.true;
        done();
      });
    });
  });


  after(function () {
    requester.close();
    server.stop();
  });

});
