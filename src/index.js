const log = require("@knowdev/log");

const echoRoute = require("./routes/echo.route");
const projectHandler = require("./functions/projectHandler.function");
const summarizeRequest = require("./functions/summarizeRequest.function");
const summarizeResponse = require("./functions/summarizeResponse.function");

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
