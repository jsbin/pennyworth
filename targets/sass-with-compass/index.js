'use strict';

/**
 * Note: this expects that `compass watch` is running against the ouput dir
 */

var fs = require('fs');
var path = require('path');
var Gaze = require('gaze');

var output = path.join(__dirname, 'output');

fs.mkdir(output, function () {});

module.exports = function (resolve, reject, data) {
  // Watch all .js files/dirs in process.cwd()
  var targetOutput = path.join(output, 'stylesheets', data.url, data.revision + '.css');
  var gaze = new Gaze(targetOutput, function(error) {
    if (error) {
      return reject(error);
    }

    this.on('changed', function(filepath) {
      console.log('gaze detected change on ' + filepath);
      fs.readFile(filepath, 'utf8', function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
          gaze.close();
          fs.unlink(filepath);
        }
      });
    });
  });

  fs.mkdir(path.join(output, 'sass', data.url), function () {
    fs.writeFile(path.join(output, 'sass', data.url, data.revision + '.scss'), data.source, function (error, result) {
      console.log('file written', error, result);
    });
  });

};