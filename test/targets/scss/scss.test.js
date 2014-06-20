/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var should = require('should');

var axon = require('axon');
var requester = axon.socket('req');

var language = 'scss';
var ext = '.' + language;
var sample = 'sample';
var broken = 'broken';
var imp = 'import';
var output = '/../../../targets/' + language + '/output/';

describe('SCSS with Compass', function () {

  before(function () {
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

  // it('Should process valid @import of a bin without errors', function (done) {
  //   var fileName = sample + '_' + imp;
  //   var check = 'result';
  //   fs.readFile(__dirname + '/' + fileName + ext, function (error, file) {
  //     requester.send({
  //       language: language,
  //       source: file.toString(),
  //       url: '_' + imp,
  //       revision: '1'
  //     }, function (res) {
  //       // even in the error case we should get a res.error === null because the
  //       // scss output error is sent in the result.errors
  //       // (res.error === null).should.be.true;
  //       // res.result[check].should.exist;
  //       // fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
  //       // fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
  //       if (res.error === null && res.result[check]) {
  //         console.log('ZZZZZ');
  //         fs.readFile(__dirname + '/' + imp + ext, function (error2, file2) {
  //           requester.send({
  //             language: language,
  //             source: file2.toString(),
  //             url: sample + '_' + imp,
  //             revision: '_'
  //           }, function (res2) {
  //             (res2.error === null).should.be.true;
  //             res2.result[check].should.exist;
  //             // fs.unlink(__dirname + output + 'sass/_' + fileName + '._' + ext);
  //             // fs.unlink(__dirname + output + 'stylesheets/_' + fileName + '._.css');
  //             // fs.unlink(__dirname + output + 'sass/_' + imp + '.1' + ext);
  //             // fs.unlink(__dirname + output + 'stylesheets/_' + imp + '.1' + '.css');
  //           });
  //         });
  //       }
  //       done();
  //     });
  //   });
  // });

  after(function () {
    requester.close();
  });

});
