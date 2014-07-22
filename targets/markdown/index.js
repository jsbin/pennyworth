'use strict';

var marked = require('marked');

module.exports = function (resolve, reject, data) {
  try {
    var res = marked(data.source);
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    var errors = {
      line: null,
      ch: null,
      msg: e
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};