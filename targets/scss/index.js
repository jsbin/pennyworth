'use strict';

/**
 * Note: this expects that `compass` is installed and runnable
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var output = path.join(__dirname, 'output');

var sass = require('../sass');

sass.makeProject(output);

module.exports = function (resolve, reject, data) {
  data.ext = '.scss';
  data.output = output;

  sass(resolve, reject, data);
};
