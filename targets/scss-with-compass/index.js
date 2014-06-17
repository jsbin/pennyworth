'use strict';

/**
 * Note: this expects that `compass` is installed and runnable
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var output = path.join(__dirname, 'output');

var ext = '.scss';

fs.mkdir(output, function (error) {
  if (!error) {
    spawn('compass', ['init'], {
      cwd: output
    });
  }
});

var sass = require('../sass-with-compass');

module.exports = function (resolve, reject, data) {
  data.ext = '.scss';

  sass(resolve, reject, data);
};