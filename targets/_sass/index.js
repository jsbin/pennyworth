'use strict';

var spawn = require('child_process').spawn;

module.exports = function (resolve, reject, data) {
  var par = data.par || module.exports.par;

  var args = ['--stdin', '--quiet'];

  if (par) {
    args = args.concat(par);
  }

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
      return resolve({ "errors": error });
    }

    resolve({ "result": result });
  });

  // write to stdin and then close the stream to get the result
  sass.stdin.write(data.source);
  sass.stdin.end();
};

module.exports.par = null;