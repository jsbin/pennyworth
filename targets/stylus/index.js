var stylus = require('stylus');

var convertToStylus = function (resolve, reject, data) {
  stylus.render(data.source, function (error, css) {
    if (error) {
      reject(error);
    }
    resolve(css);
  });
};

module.exports = convertToStylus;

