'use strict';

var fs = require('fs');
var path = require('path');
var targets = path.resolve(__dirname + '/../targets');
var Promise = require('rsvp').Promise;
var available = [];

var log = require('./log');

fs.readdir(targets, function (error, files) {
  if (error) {
    console.log('Error reading targets directory');
    console.log(error);
    log.error('failed to read targets directory');
    log.error(error);
    process.exit(1);
  }

  files.forEach(function (file) {
    if (file.indexOf('.') !== 0) {
      try {
        require(path.join(targets, file));
        available.push(path.basename(file));
      } catch (error) {
        log.error('Problem with "' + file + '" module');
        log.error(error);
      }
    }
  });

  log('Processors available: ' + available.sort().join(' '));
});

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

module.exports = {
  has: has
};

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
