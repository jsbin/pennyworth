'use strict';

var fs = require('fs');
var path = require('path');
var targets = path.resolve('./targets');
var Promise = require('rsvp').Promise;
var available = [];

fs.readdir(targets, function (error, files) {
  if (error) {
    console.error('failed to read targets directory');
    console.error(error);
    process.exit(1);
  }

  console.log('Pre-processors found: ' + files.length);

  files.forEach(function (file) {
    try {
      require(path.join(targets, file));
      available.push(path.basename(file));
    } catch (error) {
      console.error('Problem with "' + file + '" module');
      console.error(error);
    }
  });
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

if (!module.parent) {
  process.on('message', function (event) {
    run(event).then(function (output) {
      process.send(output);
    }).catch(function (error) {
      console.error(error);
    }).then(function () {
      process.exit(0);
    });
  });
}
