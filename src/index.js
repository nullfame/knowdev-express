const log = require("@knowdev/log");

const echoRoute = require("./routes/echo.route");
const projectHandler = require("./functions/projectHandler.function");
const summarizeRequest = require("./util/summarizeRequest.util");
const summarizeResponse = require("./util/summarizeResponse.util");

//
//
// Export
//

module.exports = {
  echoRoute,
  log,
  projectHandler,
  summarizeRequest,
  summarizeResponse,
};
