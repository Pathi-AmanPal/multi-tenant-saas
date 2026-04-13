const logger = require("../config/logger");

function requestLogger(req, res, next) {

  logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  next();
}

module.exports = requestLogger;