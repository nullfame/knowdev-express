const HTTP = require("@knowdev/http");
const log = require("@knowdev/log");

const projectHandler = require("./projectHandler.function");

//
//
// Main
//

const httpRoute = (statusCode = HTTP.CODE.OK, context = {}) =>
  projectHandler((req, res) => {
    // Set up response
    const response = { res: { statusCode } };

    // Made status codes to messages; if the status code is not found it will be omitted
    const statusMessage = {
      [HTTP.CODE.OK]: "OK",
      [HTTP.CODE.NO_CONTENT]: "No Content",
      [HTTP.CODE.BAD_REQUEST]: "Bad Request",
      [HTTP.CODE.UNAUTHORIZED]: "Unauthorized",
      [HTTP.CODE.FORBIDDEN]: "Forbidden",
      [HTTP.CODE.NOT_FOUND]: "Not Found",
      [HTTP.CODE.GONE]: "Gone",
      [HTTP.CODE.TEAPOT]: "I'm a teapot",
      [HTTP.CODE.INTERNAL_ERROR]: "Internal Error",
      [HTTP.CODE.BAD_GATEWAY]: "Bad Gateway",
      [HTTP.CODE.UNAVAILABLE]: "Unavailable",
      [HTTP.CODE.GATEWAY_TIMEOUT]: "Gateway Timeout",
    };

    // Match the status message to the status code; if the status code is not found it will be omitted because the map will return undefined
    response.res.statusMessage = statusMessage[statusCode];

    // Warn if the message is not found
    if (!response.res.statusMessage) {
      log.warn(
        `@knowdev/express: Status code ${statusCode} not found in statusMessage map`
      );
      log.trace.var(statusMessage);
      log.debug("Continuing...");
    }

    // Send the response
    return res.status(statusCode).json(response);
  }, context);

//
//
// Export
//

module.exports = httpRoute;
