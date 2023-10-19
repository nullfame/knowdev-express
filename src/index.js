const echoRoute = require("./routes/echo.route");
const httpRoute = require("./functions/httpRoute.function");
const { projectHandler } = require("./modules");

const log = require("./util/log.util");
const summarizeRequest = require("./util/summarizeRequest.util");
const summarizeResponse = require("./util/summarizeResponse.util");

//
//
// Export
//

module.exports = {
  echoRoute,
  httpRoute,
  log,
  projectHandler,
  summarizeRequest,
  summarizeResponse,
};
