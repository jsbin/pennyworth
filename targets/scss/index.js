'use strict';

var spawn = require('child_process').spawn;

module.exports = function (resolve, reject, data) {
  var args = ['--stdin', '--quiet', '--scss'];

  var sass = spawn('sass', args);

  sass.stderr.setEncoding('utf8');
  sass.stdout.setEncoding('utf8');
  sass.stdin.setEncoding('utf8');


  var result = '';
  var error = '';

  sass.stdout.on('data', function (data) {
    result += data;
  });

  sass.stderr.on('data', function (data) {
    error += data;
  });

  sass.on('close', function () {
    if (error) {
      return reject(error);
    }

    resolve(result);
  });

  // write to stdin and then close the stream to get the result
  sass.stdin.write(data.source);
  sass.stdin.end();
};