'use strict';

var markdown = require('markdown').markdown;

module.exports = function (resolve, reject, data) {
  try {
    var res = markdown.toHTML(data.source);
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