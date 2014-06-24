'use strict';
var jade = require('jade');

module.exports = function (resolve, reject, data) {
  try {
    var res = jade.compile(data.source)();
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    var line = e.message.match(/Jade:(\d+)/);
    var msg = e.message.match(/\n\n(.+)$/);
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
};
