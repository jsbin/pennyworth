/**
 * Process
 * Take a string input, with language output, and spawn a process and send back
 * the result.
 */
'use strict';

var axon = require('axon');
var responder = axon.socket('rep');

var Promise = require('rsvp').Promise;
var fork = require('child_process').fork;

var log = require('./log');
var processors = require('./processors');

var port = process.env.PORT || 5555;
var host = process.env.HOST || '0.0.0.0';

function start() {
  responder.bind(port, host);
  responder.on('socket error', function (error) {
    log(error);
  });
  responder.on('bind', function () {
    log('Ready on tcp://' + host + ':' + port + '...');
    bind();
  }).on('connect', function () {
    log('new connection');
  });
}

function json(str) {
  return new Promise(function (resolve) {
    resolve(JSON.parse(str));
  });
}
/*
  expects req:
    { language: "markdown", source: "# Heading\n\nFoo *bar*", url: "abc", revsion: 12 }
    { language: "scss", source: "..." }
    { language: "scss-compass", source: "..." }
*/

if (module.parent) {
  // not in use yet, and not tested as a submodule
  module.exports = {
    start: start
  };
} else {
  start();
}
