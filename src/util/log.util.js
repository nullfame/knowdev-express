const { Logger, LOG_FORMAT, LOG_LEVEL } = require("@knowdev/log");

//
//
// Constants
//

//
//
// Logger
//

const log = new Logger({
  format: LOG_FORMAT.JSON,
  level: LOG_LEVEL.TRACE,
});

//
//
// Export
//

module.exports = log;
