'use strict';
module.exports = function (origin) {
  if (!Array.isArray(origin)) {
    origin = [origin];
  }
  return function (req, res, next) {
    var headers = req.header('Access-Control-Request-Headers');

    // TODO should this check if the request is via the API?
    if (req.headers.origin && origin.indexOf(req.header.origin) !== -1) {
      res.header({
        'Access-Control-Allow-Origin':  req.header.origin,
        'Access-Control-Allow-Headers': headers,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      });
      req.cors = true;
    } else if (req.header.origin) {
      res.send(401);
    }

    if (req.method === 'OPTIONS') {
      res.send(204);
    } else {
      next();
    }
  };
};
