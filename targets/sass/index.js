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
    spawn('compass', ['create', '--syntax', 'sass'], {
      cwd: output
    });
  } else {
    // check for project files
    var projFiles = ['config.rb', 'sass', 'stylesheets'];
    projFiles.forEach(function (name) {
      var file = path.join(output, name);
      fs.exists(file, function(exists) {
        if (!exists) {
          console.log('Error: ' + file + ' not created');
        }
      });
    });
  }
});

module.exports = function (resolve, reject, data) {
  var ext = data.ext || module.exports.ext;
  var output = data.output || module.exports.output;
  var targetFile = path.join(output, 'stylesheets', data.file + '.css');
  var sourceFile = path.join('sass', data.file + ext);

  fs.writeFile(path.join(output, sourceFile), data.source, function () {
    var args = ['compile', sourceFile, '--no-line-comments', '--boring'];

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

    compass.on('error', function (error) {
      reject(error);
    });

    compass.on('close', function () {
      if (error) {
        return reject(error);
      }

      // this is because syntax errors are put on stdout...
      if (result.indexOf('error ' + sourceFile) !== -1) {
        // var errors = [];
        // result.trim().replace(/\(Line\s+([\d]+):\s*(.*?)\)$/g, function (a, n, e) {
        //   errors.push({
        //     line: n,
        //     msg: e
        //   });
        // });
        // send the errors so we can show them
        return resolve({ "errors": result });
      }

      // if okay, then try to read the target
      fs.readFile(targetFile, 'utf8', function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve({ "result": data });
        }
      });
    });

    //*/
  });
};

module.exports.ext = '.sass';
module.exports.output = output;