/* global describe, it, after, before */
'use strict';

var fs = require('fs');

var axon = require('axon');
var requester = axon.socket('req');

describe('SCSS with Compass', function () {

  before(function () {
    console.log('before');
    requester.connect('tcp://localhost:5555');
  });

  it('Should process valid SCSS without errors', function (done) {
    fs.readFile(__dirname + '/sample.scss', function (error, file) {
      console.log('read file');
      requester.send({
        language: 'scss-with-compass',
        source: file
      }, function (res) {
        console.log(res); 
        done();
      });
    });
  });

  it('Should process invalid SCSS and give back an error', function (done) {
    fs.readFile(__dirname + '/broken.scss', function (error, file) {
      console.log('read file');
      requester.send({
        language: 'scss-with-compass',
        source: file
      }, function (res) {
        console.log(res); 
        done();
      });
    });
  });

  after(function () {
    console.log('after');
    requester.close();
  });

});
