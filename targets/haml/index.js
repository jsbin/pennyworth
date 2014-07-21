'use strict';

/**
 * Note: this expects that `haml` is installed and runnable
 */

var spawn = require('child_process').spawn;

module.exports = function (resolve, reject, data) {
  var par = data.par || module.exports.par;

  // --suppress-eval is the option to disable attribute hashes and Ruby scripts
  // designated by = or ~ - said scripts are rendered as empty strings
  var args = ['--stdin', '--suppress-eval'];

  if (par) {
    args = args.concat(par);
  }

  var haml = spawn('haml', args);

  haml.stderr.setEncoding('utf8');
  haml.stdout.setEncoding('utf8');
  haml.stdin.setEncoding('utf8');

  var result = '';
  var error = '';

  haml.stdout.on('data', function (data) {
    result += data;
  });

  haml.stderr.on('data', function (data) {
    error += data;
  });

  haml.on('error', function (error) {
    reject(error);
  });

  haml.on('close', function () {
    if (error.indexOf('error on line') !== -1) {
      var errors = [];
      var resultArr = error.split('\n');
      resultArr.forEach(function (line) {
        // index starts at 1
        line.trim().replace(/on line\s+([\d]+):\s*(.*?)$/g, function (a, n, e) {
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

    resolve({
      errors: null,
      result: result
    });
  });

  // write to stdin and then close the stream to get the result
  haml.stdin.write(data.source);
  haml.stdin.end();

};