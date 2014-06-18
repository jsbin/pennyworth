var jade = require('jade');

module.exports = function (resolve, reject, data) {
  try {
    resolve(jade.compile(data.source)());
  } catch (e) {
    reject(e);
  }
};
