'use strict';

var fs = require('fs');
var path = require('path');
var targets = path.resolve(__dirname + '/../targets');
var Promise = require('rsvp').Promise;
var EventEmitter = require('events').EventEmitter;
var available = [];

// make our processors object eventy
var processors = Object.create(EventEmitter.prototype);
EventEmitter.call(processors);

processors.has = has;
processors.run = run;

// processors is our exported module
module.exports = processors;


loadTargets().then(function () {
  processors.emit('ready');
}).catch(function (error) {
  processors.emit('error', error);
});

function loadTargets() {
  return new Promise(function (resolve, reject) {
    fs.readdir(targets, function (error, files) {
      if (error) {
        processors.emit('error', 'failed to read targets directory', error);
        return reject(error);
      }

      files.forEach(function (file) {
        if (file.indexOf('.') !== 0) {
          try {
            require(path.join(targets, file));
            available.push(path.basename(file));
          } catch (error) {
            processors.emit('error', 'Problem with "' + file + '" module', error);
          }
        }
      });

      processors.emit('log', 'Processors available: ' + available.sort().join(' '));
      resolve([].slice.call(available));
    });
  });
}

function has(language) {
  return available.indexOf(language) !== -1;
}

function run(event) {
  // TODO start timer for metric
  return new Promise(function (resolve, reject) {
    var module = require(path.join(targets, event.language));
    // FIXME ensure the url and revision are legit
    module(resolve, reject, {language: event.language, source: event.source, file: event.url + '.' + event.revision});
  }).then(function (data) {
    // end timer
    return data;
  }, function (error) {
    // end timer
    throw error;
  });
}

function send(data) {
  process.send(JSON.stringify(data));
}

if (!module.parent) {
  process.on('message', function (event) {
    run(event).then(function (output) {
      send({ result: output, error: null });
    }).catch(function (error) {
      send({ error: error });
    }).then(function () {
      process.exit(0);
    });
  });
}
