'use strict';

/**
 * Note: this expects that `compass` is installed and runnable
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var output = path.join(__dirname, 'output');

fs.mkdir(output, function (error) {
  if (!error) {
    spawn('compass', ['init'], {
      cwd: output
    });
  }
});

module.exports = function (resolve, reject, data) {
  // FIXME ensure the data.url and revision are legit
  var targetFile = path.join(output, 'stylesheets', data.url + '.' + data.revision + '.css');
  var sourceFile = path.join('sass', data.url + '.' + data.revision + '.scss');

  fs.writeFile(path.join(output, sourceFile), data.source, function () {
    var args = ['compile', sourceFile, '--no-line-comments', '--boring'];
    console.log('compass', args);

    var compass = spawn('compass', args, {
      cwd: output
    });

    compass.stderr.setEncoding('utf8');
    compass.stdout.setEncoding('utf8');

    var result = '';
    var error = '';

    compass.stdout.on('data', function (data) {
      result += data;
    });

    compass.stderr.on('data', function (data) {
      error += data;
    });

    compass.on('close', function () {
      if (error) {
        return reject(error);
      }

      // this is because syntax errors are put on stdout...
      if (result.indexOf('error ' + sourceFile) !== -1) {
        var errors = [];
        result.trim().replace(/\((Line.*?\))/g, function (a, m) {
          errors.push(m);
        });
        return reject(errors);
      }

      // if okay, then try to read the target
      fs.readFile(targetFile, 'utf8', function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

    //*/
  });
};