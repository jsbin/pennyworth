/**
 * Process
 * Take a string input, with language output, and spawn a process and send back
 * the result.
 */
'use strict';

var fork = require('child_process').fork;

var axon = require('axon');
var Promise = require('rsvp').Promise;

var log = require('./log');
var processors = require('./processors');


var port = process.env.PORT || 5555;
var host = process.env.HOST || '0.0.0.0';

function start() {
  var responder = axon.socket('rep');
  responder.bind(port, host);
  console.log('binding to tcp://' + host + ':' + port);
  responder.on('socket error', function (error) {
    log(error);
  });
  responder.on('bind', function () {
    log('Ready on tcp://' + host + ':' + port + '...');
    bind();
  }).on('connect', function () {
    log('new connection');
  });
  if (this !== GLOBAL) {
    this.stop = responder.close.bind(responder);
  }
  function bind() {
    responder.on('message', function (req, reply) {
      log('message in for: ' + req.language);
      if (processors.has(req.language)) {
        var p = new Promise(function (resolve, reject) {
          var child = fork(__dirname + '/processors');
          var output = '';

          var timeout = setTimeout(function () {
            log.error(req.language + ' processor timeout');
            child.kill();
            reject({ error: 'timeout', data: null });
          }, 10000);

          child.on('error', function (data) {
            reject({ error: 'errors', data: data });
          });

          child.on('message', function (message) {
            output += message;
          });

          child.on('exit', function () {
            clearTimeout(timeout);
            json(output).then(function (result) {
              if (result.error) {
                reject(result);
              } else {
                resolve(result);
              }
            }).catch(function () {
              log.error('corrupted result from ' + req.language);
            });
          });

          child.send(req);
        });

        p.then(function (result) {
          reply(result);
        }).catch(function (error) {
          reply(error);
        });
      }
    });
  }
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
