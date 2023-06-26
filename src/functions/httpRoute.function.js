const HTTP = require("@knowdev/http");
const log = require("@knowdev/log");
const {
  BadGatewayError,
  BadRequestError,
  ForbiddenError,
  GatewayTimeoutError,
  GoneError,
  InternalError,
  NotFoundError,
  TeapotError,
  UnauthorizedError,
  UnavailableError,
} = require("@knowdev/errors");

const projectHandler = require("./projectHandler.function");

//
//
// Main
//

const httpRoute = (statusCode = HTTP.CODE.OK, context = {}) => {
  // Give a default name if there isn't one
  if (!context.name) {
    context.name = "_httpRoute";
  }

  // Return a function that will be used as an express route
  return projectHandler((req, res) => {
    // Set up response
    const response = { res: { statusCode } };

    // Map the most throwable status codes to errors and throw them!
    const error = {
      [HTTP.CODE.BAD_REQUEST]: BadRequestError,
      [HTTP.CODE.UNAUTHORIZED]: UnauthorizedError,
      [HTTP.CODE.FORBIDDEN]: ForbiddenError,
      [HTTP.CODE.NOT_FOUND]: NotFoundError,
      [HTTP.CODE.GONE]: GoneError,
      [HTTP.CODE.TEAPOT]: TeapotError,
      [HTTP.CODE.INTERNAL_ERROR]: InternalError,
      [HTTP.CODE.BAD_GATEWAY]: BadGatewayError,
      [HTTP.CODE.UNAVAILABLE]: UnavailableError,
      [HTTP.CODE.GATEWAY_TIMEOUT]: GatewayTimeoutError,
    };

    // If this maps to an error, throw it
    if (error[statusCode]) {
      log.trace(
        `@knowdev/express: gracefully throwing ${statusCode} up to projectHandler`
      );
      throw new error[statusCode]();
    }

    // If this is an error and we didn't get thrown, log a warning
    if (statusCode >= 400) {
      log.warn(
        `@knowdev/express: status code ${statusCode} not mapped as throwable`
      );
    }

    // Made status codes to messages; if the status code is not found it will be omitted
    const statusMessage = {
      [HTTP.CODE.OK]: "OK",
      [HTTP.CODE.NO_CONTENT]: "No Content",
      // Not including error codes because they are handled above
    };

    // Match the status message to the status code; if the status code is not found it will be omitted because the map will return undefined
    response.res.statusMessage = statusMessage[statusCode];

    // Warn if the message is not found
    if (!response.res.statusMessage) {
      log.warn(
        `@knowdev/express: Status code ${statusCode} not found in statusMessage map`
      );
      log.trace.var(statusMessage);
    }

    // Send the response
    return res.status(statusCode).json(response);
  }, context);
};

//
//
// Export
//

module.exports = httpRoute;
