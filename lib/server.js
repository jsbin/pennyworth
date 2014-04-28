/**
 * Process
 * Take a string input, with language output, and spawn a process and send back
 * the result.
 */
'use strict';

var zmq = require('zmq');
var responder = zmq.socket('rep');
var Promise = require('rsvp').Promise;
var fork = require('child_process').fork;
var processors = require('./processors');

function start() {
  responder.bind('tcp://*:5555', function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Ready on 5555...');
      bind();
    }
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
  responder.on('message', function (rawreq) {
    json(rawreq).then(function (req) {
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
          responder.send(JSON.stringify(result));
        }).catch(function (error) {
          responder.send(JSON.stringify(error));
        });
      }
    }).catch(function () {
      console.log('ignored ' + rawreq);
    });
  });
}

process.on('SIGINT', function() {
  if (responder) {
    responder.close();
  }
});

if (module.parent) {
  // not in use yet, and not tested as a submodule
  module.exports = {
    start: start,
    stop: function () {
      if (responder) {
        responder.close();
      }
    }
  };
} else {
  start();
}