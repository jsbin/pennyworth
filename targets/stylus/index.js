'use strict';
var stylus = require('stylus');

var convertToStylus = function (resolve, reject, data) {
  stylus.render(data.source, function (error, css) {
    if (error) {
      var line = error.message.match(/stylus:(\d+)/);
      var msg = error.message.match(/\n\n(.+)\n$/);
      var errors = {
        line: line[1],
        ch: null,
        msg: msg[1]
      };
      resolve({
        errors: [errors],
        result: null
      });
    }
    var res = css;
    resolve({
      errors: null,
      result: res
    });
  });
};

module.exports = convertToStylus;

