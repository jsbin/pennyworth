'use strict';

/**
 * Note: this expects that `compass` is installed and runnable
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var output = path.join(__dirname, 'output');

// make folder and create compass project
fs.mkdir(output, function (error) {
  if (!error) {
    try {
      spawn('compass', ['create'], {
        cwd: output
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    // check for project files
    var projFiles = ['config.rb', 'sass', 'stylesheets'];
    projFiles.forEach(function (name) {
      var file = path.join(output, name);
      fs.exists(file, function (exists) {
        if (!exists) {
          console.log('Error: ' + file + ' not created');
        }
      });
    });
  }
});

var sass = require('../sass');

module.exports = function (resolve, reject, data) {
  data.ext = '.scss';
  data.output = output;

  sass(resolve, reject, data);
};
