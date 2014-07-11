/**
 * Process
 * Take a string input, with language output, and spawn a process and send back
 * the result.
 */
'use strict';

var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var axon = require('axon');
var Promise = require('rsvp').Promise; // jshint ignore:line
var processors = require('./processors');
var log = require('./log');
var psTree = require('ps-tree');

var port = process.env.PORT || 5555;
var host = process.env.HOST || '0.0.0.0';

var server = {
  start: start,
  stop: function () {} // assigned when we start
};

module.exports = server;

function start() {
  var local = host === '0.0.0.0';
  var responder = axon.socket('rep');
  // responder.bind(port, host);
  if (local) {
    // this is a fudge to allow tests to work
    responder.bind(port, host);
    responder.on('bind', function () {
      log('Ready on tcp://' + host + ':' + port + '...');
      server.stop = responder.close.bind(responder);
      bind();
    }).on('connect', function () {
      log('new connection');
    });
  } else {
    // production based, connect to the remote port
    log('connecting to pull from host: ' + host + ':' + port);
    responder.connect(port, host);
    responder.on('connect', function () {
      log('Ready pulling on tcp://' + host + ':' + port + '...');
      server.stop = responder.close.bind(responder);
      bind();
    }).on('bind', function () {
      log('new connection');
    });
  }
  responder.on('socket error', log).on('error', log).on('close', function () {
    log('closed connection');
  });

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
            //TODO
            psTree(child.pid, function (err, children) {
              // console.log(child.pid);
              spawn('kill', ['-s', 'SIGTERM', child.pid].concat(children.map(function (p) {
                return p.PID;
              })));
            });
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

if (!module.parent) {
  start();
}