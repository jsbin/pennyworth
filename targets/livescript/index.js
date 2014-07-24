'use strict';
var livescript = require('LiveScript');

var convertToLiveScript = function (resolve, reject, data) {
  try {
    var res = livescript.compile(data.source);
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    // index starts at 1
    var lineMatch = e.message.match(/on line (\d+)/) || [,];
    var line = parseInt(lineMatch[1], 10) || 0;
    if (line > 0) {
      line = line - 1;
    }
    var msg = e.message.match(/(.+) on line (\d+)$/) || [,];
    var errors = {
      line: line,
      ch: null,
      msg: msg[1]
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};

module.exports = convertToLiveScript;
