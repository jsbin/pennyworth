'use strict';

/**
 * Note: this expects that `compass watch` is running against the ouput dir
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var output = path.join(__dirname, 'output');

fs.mkdir(output, function () {});

module.exports = function (resolve, reject, data) {
  // FIXME ensure the data.url and revision are legit
  var targetFile = path.join(output, 'stylesheets', data.url + '.' + data.revision + '.css');
  var sourceFile = path.join(output, 'sass', data.url + '.' + data.revision + '.scss');
  console.log('looking for ' + targetFile);

  fs.mkdir(path.join(output, 'sass', data.url), function () {
    fs.writeFile(sourceFile, data.source, function (error, result) {
      console.log('file written', error, result);
      console.log('compass', ['compile', sourceFile]);
      var compass = spawn('compass', ['compile', sourceFile], {
        cwd: output
      });

      compass.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
      });

      compass.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        reject(data.toString());
      });

      compass.on('close', function (code) {
        console.log('child process exited with code ' + code);

        // if okay, then try to read the target
        fs.readFile(targetFile, 'utf8', function (error, data) {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    });
  });

};