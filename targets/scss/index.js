'use strict';

var spawn = require('child_process').spawn;

var sass = require('../sass');

module.exports = function (resolve, reject, data) {
  data.par = '--scss';

  sass(resolve, reject, data);
};