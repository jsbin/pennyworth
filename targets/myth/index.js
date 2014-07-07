'use strict';
var myth = require('myth');

module.exports = function convertMyth(resolve, reject, data) {
  try {
    var res = myth(data.source);
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    // index starts at 1
    var line = parseInt(e.line, 10) || 0;
    var ch = parseInt(e.column, 10) || 0;
    if (line > 0) {
      line = line - 1;
    }
    if (ch > 0) {
      ch = ch - 1;
    }
    var errors = {
      line: line,
      ch: ch,
      msg: e.message
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};