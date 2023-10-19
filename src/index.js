console.log("Entering index.js");

console.log("index.js: require echo.route");
const echoRoute = require("./routes/echo.route");
const httpRoute = require("./functions/httpRoute.function");
const { projectHandler } = require("./modules");

console.log("index.js: require log.util");
const log = require("./util/log.util");
const summarizeRequest = require("./util/summarizeRequest.util");
const summarizeResponse = require("./util/summarizeResponse.util");

//
//
// Export
//

console.log("index.js: module.exports");
module.exports = {
  echoRoute,
  httpRoute,
  log,
  projectHandler,
  summarizeRequest,
  summarizeResponse,
};
