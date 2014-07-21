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
var metrics = require('./metrics');
var psTree = require('ps-tree');

var port = process.env.PORT || 5555;
var host = process.env.HOST;
var timeout = process.env.TIMEOUT || 10000; // 10 seconds default

if (!host) {
  console.error('To use pennyworth, you must specify a host to pull from:\n\n$ HOST=mysite.com node .\n\n');
  process.exit(1);
}

var server = {
  start: start,
  stop: function () {} // assigned when we start
};

module.exports = server;

function start() {
  var local = (host === '0.0.0.0' || host === 'localhost');
  var responder = axon.socket('rep');

  var connectEvent, connectMethod, newConnectionEvent;
  connectEvent = connectMethod = local ? 'bind' : 'connect';
  newConnectionEvent = local ? 'connect' : 'bind';

  responder[connectMethod](port, host);
  responder.once(connectEvent, function () {
    log('Ready pulling on tcp://' + host + ':' + port + '...');
    server.stop = responder.close.bind(responder);
    bind();
  }).on(newConnectionEvent, function () {
    log('new connection');
  });

  var lastSocketError = null;

  responder.on('socket error', function (error) {
    if (!lastSocketError || lastSocketError.message !== error.message) {
      lastSocketError = error;
      console.error('socket error: ' + error.message);
    }
  }).on('error', log).on('close', function () {
    log('closed connection');
  });

  function bind() {
    responder.on('message', function (req, reply) {
      log('message in for: ' + req.language);
      if (processors.has(req.language)) {
        // send metric increment for event.language
        metrics.increment(req.language + '.run');
        // start timer for metric
        var metricTimer = metrics.createTimer(req.language + '.timer');

        var p = new Promise(function (resolve, reject) {
          var child = fork(__dirname + '/processors');
          var output = '';

          var timer = setTimeout(function () {
            log.error(req.language + ' processor timeout');
            child.kill();
            //TODO
            psTree(child.pid, function (err, children) {
              // console.log(child.pid);
              spawn('kill', ['-s', 'SIGTERM', child.pid].concat(children.map(function (p) {
                return p.PID;
              })));
            });
            metrics.increment(req.language + '.timeout');
            reject({ error: 'timeout', data: null });
          }, timeout);

          child.on('error', function (data) {
            reject({ error: 'errors', data: data });
          });

          child.on('message', function (message) {
            output += message;
          });

          child.on('exit', function () {
            clearTimeout(timer);
            json(output).then(function (response) {
              if (response.error) {
                reject(response);
              } else {
                resolve(response);
              }
            }).catch(function () {
              log.error('corrupted result from ' + req.language);
            });
          });

          child.send(req);
        });

        p.then(function (result) {
          reply(result);
          if (result.errors === null) {
            metrics.increment(req.language + '.run.successful');
          } else {
            metrics.increment(req.language + '.run.error');
          }
        }).catch(function (error) {
          reply(error);
          metrics.increment(req.language + '.error');
        }).then(function () {
          metricTimer.stop();
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
