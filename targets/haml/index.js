'use strict';

/**
 * Note: this expects that `haml` is installed and runnable
 */

var spawn = require('child_process').spawn;

module.exports = function (resolve, reject, data) {
  var par = data.par || module.exports.par;

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

  console.log('result', result);
  console.log('error', error);

  haml.on('error', function (error) {
    reject(error);
  });

  haml.on('close', function () {
    if (error) {
      return reject(error);
    }

    resolve({ "result": result});
  });

  // write to stdin and then close the stream to get the result
  haml.stdin.write(data.source);
  haml.stdin.end();

};