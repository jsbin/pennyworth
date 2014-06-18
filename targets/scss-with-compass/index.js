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
    spawn('compass', ['create'], {
      cwd: output
    });
  }
  else {
    // check for project files
    var projFiles = ['config.rb', 'sass', 'stylesheets'];
    for (var i = 0; i < projFiles.length; i++) {
      (function(name) {
        var file = path.join(output, name);
        fs.exists(file, function(exists) {
          if (!exists) {
            console.log('Error: ' + file + ' not created');
          }
        });
      })(projFiles[i]);
    }
  }
});

var sass = require('../sass-with-compass');

module.exports = function (resolve, reject, data) {
  data.ext = '.scss';
  data.output = output;

  sass(resolve, reject, data);
};