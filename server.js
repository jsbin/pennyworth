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

responder.bind('tcp://*:5555', function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Ready on 5555...');
  }
});

function json(str) {
  return new Promise(function (resolve) {
    resolve(JSON.parse(str));
  });
}

/*
  expects req:
    { language: "markdown", data: "# Heading\n\nFoo *bar*", url: "abc", revsion: 12 }
    { language: "scss", data: "..." }
    { language: "scss-compass", data: "..." }
*/
responder.on('message', function (rawreq) {
  json(rawreq).then(function (req) {

    console.log('message in: ' + req);
    if (processors.has(req.language)) {
      var p = new Promise(function (resolve, reject) {
        var child = fork('./processors');
        var output = '';

        var timeout = setTimeout(function () {
          console.error(req.language + ' processor timeout');
          child.kill();
          reject({ error: 'timeout', data: null });
        }, 1000);

        child.on('stderr', function (data) {
          console.error(req.language + ' processor errors');
          console.error(data);
          reject({ error: 'errors', data: data });
        });

        child.on('message', function (message) {
          output += message;
        });

        child.on('exit', function () {
          clearTimeout(timeout);
          resolve(output);
        });

        child.send(req);
      });

      p.then(function (result) {
        responder.send(JSON.stringify({ error: null, data: result }));
      }).catch(function (error) {
        responder.send(JSON.stringify(error));
      });
    }
  }).catch(function () {
    console.log('ignored ' + rawreq);
  });
});

process.on('SIGINT', function() {
  responder.close();
});
