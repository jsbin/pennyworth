'use strict';
/*global describe:true, it: true */
var fork = require('child_process').fork;
var assert = require('assert');

function run() {
  var proc = fork('server', {
    env: process.env,
    cwd: process.cwd(),
    encoding: 'utf8',
    silent: true,
  });

  proc.stderr.setEncoding('utf8');
  proc.stdout.setEncoding('utf8');

  return proc;
}

function doneOnceStopped(proc, error, done) {
  if (proc) {
    proc.on('exit', function () {
      proc = null;
      done(error);
    });
    proc.kill();
  } else {
    done(error);
  }
}

describe('zeromq', function () {

  it('should start server', function (done) {
    var server = run();

    server.stdout.on('data', function (data) {
      if (data.indexOf('Error:') !== -1) {
        doneOnceStopped(server, 'Server did not start correctly: ' + data, done);
      }

      if (data.indexOf('Ready on ') !== -1) {
        assert(true, 'Server ' + data.toLowerCase());
        doneOnceStopped(server, null, done);
      }
    });

    server.stderr.on('data', function (data) {
      console.log(data);
      doneOnceStopped(server, 'Failed on starting server: ' + data, done);
    });
  });
});