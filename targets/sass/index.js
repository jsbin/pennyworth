'use strict';

/**
 * Note: this expects that `compass` is installed and runnable
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var output = path.join(__dirname, 'output');

var makeProject = function(output, isSass) {
  var configFile = 'config.rb';

  // make folder and create compass project
  fs.mkdir(output, function (error) {
    if (!error) {
      // copy config.rb
      var w = fs.createWriteStream(output + '/' + configFile);
      var r = fs.createReadStream(path.join(__dirname, '..', '..', configFile)).pipe(w);

      if (isSass) {
        r.on('finish', function(){
          fs.createWriteStream(output + '/' + configFile, {flags: 'a'}).write('\npreferred_syntax = :sass');
        });
      }
      
      // FIXME we should actuall install compass to the travis box pre-test
      try {
        spawn('compass', ['init'], {
          cwd: output
        });
      } catch (e) {
        console.error('Failed compass init');
        console.error(e);
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
};

makeProject(output, true);

module.exports = function (resolve, reject, data) {
  var ext = data.ext || module.exports.ext;
  var output = data.output || module.exports.output;
  var targetFile = path.join(output, 'stylesheets', data.file + '.css');
  var sourceFile = path.join('sass', data.file + ext);

  fs.writeFile(path.join(output, sourceFile), data.source, function () {
    var args = ['compile', sourceFile, '--no-line-comments', '--boring', '--quiet'];

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
        var errors = [];
        var resultArr = result.split('\n');
        resultArr.forEach(function (line) {
          // index starts at 1
          line.trim().replace(/\(Line\s+([\d]+):\s*(.*?)(\)|\.)$/g, function (a, n, e) {
            var l = parseInt(n, 10) || 0;
            if (l > 0) {
              l = l - 1;
            }
            errors.push({
              line: l,
              ch: null,
              msg: e
            });
          });
        });
        // send the errors so we can show them
        return resolve({
          errors: errors,
          result: null
        });
      }

      // if okay, then try to read the target
      fs.readFile(targetFile, 'utf8', function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve({
            errors: null,
            result: data
          });
        }
      });
    });

    //*/
  });
};

module.exports.ext = '.sass';
module.exports.output = output;
module.exports.makeProject = makeProject;
