var jade = require('jade');

var convertToJade = function (resolve, reject, data) {
  try {
    resolve(jade.compile(data.source)());
  } catch (e) {
    reject(e);
  }
};

module.exports = convertToJade;
