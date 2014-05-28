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
var processors = require('./processors');

var port = process.env.PORT || 5555;
var host = process.env.HOST || '0.0.0.0';

function start() {
  responder.bind(port, host);
  responder.on('socket error', function (error) {
    console.log(error);
  });
  responder.on('bind', function () {
    console.log('Ready on tcp://' + host + ':' + port + '...');
    bind();
  }).on('connect', function () {
    console.log('new connection');
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
function bind() {
  responder.on('message', function (req, reply) {
    console.log('message in for: ' + req.language);
    if (processors.has(req.language)) {
      var p = new Promise(function (resolve, reject) {
        var child = fork(__dirname + '/processors');
        var output = '';

        var timeout = setTimeout(function () {
          console.error(req.language + ' processor timeout');
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
            console.error('corrupted result from ' + req.language);
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

if (module.parent) {
  // not in use yet, and not tested as a submodule
  module.exports = start;
} else {
  start();
}