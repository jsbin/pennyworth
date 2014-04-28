'use strict';

var fs = require('fs');
var path = require('path');
var targets = path.resolve(__dirname + '/../targets');
var Promise = require('rsvp').Promise;
var available = [];

fs.readdir(targets, function (error, files) {
  if (error) {
    console.error('failed to read targets directory');
    console.error(error);
    process.exit(1);
  }

  files.forEach(function (file) {
    if (file.indexOf('.') !== 0) {
      try {
        require(path.join(targets, file));
        available.push(path.basename(file));
      } catch (error) {
        console.error('Problem with "' + file + '" module');
        console.error(error);
      }
    }
  });

  console.log('Processors available: ' + available.sort().join(' '));
});

function has(language) {
  return available.indexOf(language) !== -1;
}

function run(event) {
  return new Promise(function (resolve, reject) {
    var module = require(path.join(targets, event.language));
    module(resolve, reject, event);
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
