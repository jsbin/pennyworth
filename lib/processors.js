'use strict';

var fs = require('fs');
var path = require('path');
var targets = path.resolve(__dirname + '/../targets');
var Promise = require('rsvp').Promise;
var EventEmitter = require('events').EventEmitter;
var log = require('./log');
var metrics = require('./metrics');
var available = [];

// make our processors object eventy
var processors = new EventEmitter();

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
  // send metric increment for event.language
  metrics.increment(lang + '.run');
  // start timer for metric
  var timer = metrics.createTimer(lang + '.timer');
  return new Promise(function (resolve, reject) {
    var module = require(path.join(targets, lang));
    // FIXME ensure the url and revision are legit
    module(resolve, reject, {language: lang, source: event.source, file: event.url + '.' + event.revision});
  }).then(function (data) {
    // end timer
    timer.stop();
    if (data.errors === null) {
      metrics.increment(lang + '.run.successfull');
    } else {
      metrics.increment(lang + '.run.error');
    }
    return data;
  }, function (error) {
    // end timer
    timer.stop();
    metrics.increment(lang + '.error');
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
