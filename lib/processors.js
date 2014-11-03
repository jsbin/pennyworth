'use strict';

var fs = require('fs');
var path = require('path');
var targets = path.resolve(__dirname + '/../targets');
var Promise = require('rsvp').Promise; // jshint ignore:line
var EventEmitter = require('events').EventEmitter;
var log = require('./log');
var available = [];

// make our processors object eventy
var processors = new EventEmitter();

processors.has = has;
processors.run = run;

// processors is our exported module
module.exports = processors;

function loadTargets() {
  return new Promise(function (resolve, reject) {
    fs.readdir(targets, function (error, files) {
      if (error) {
        log.error('failed to read targets directory', error);
        return reject(error);
      }

      files.forEach(function (file) {
        if (file.indexOf('.') !== 0) {
          try {
            require(path.join(targets, file));
            available.push(path.basename(file));
          } catch (error) {
            log.error('Problem with "' + file + '" module', error);
          }
        }
      });

      log('Processors available: ' + available.sort().join(' '));
      resolve([].slice.call(available));
    });
  });
}

function has(language) {
  return available.indexOf(language) !== -1;
}

function run(event) {
  var lang = event.language;
  return new Promise(function (resolve, reject) {
    var module = require(path.join(targets, lang));
    // FIXME ensure the url and revision are legit
    module(resolve, reject, {language: lang, source: event.source, file: event.url + '.' + event.revision});
  });
}

function send(data) {
  process.send(JSON.stringify(data));
}

if (!module.parent) {
  processors.emit('ready');
  process.on('message', function (event) {
    run(event).then(function (output) {
      send({ output: output, error: null });
    }).catch(function (error) {
      send({ error: error });
    }).then(function () {
      process.exit(0);
    });
  });
} else {
  loadTargets().then(function () {
    processors.emit('ready');
  }).catch(function (error) {
    processors.emit('error', error);
  });
}
