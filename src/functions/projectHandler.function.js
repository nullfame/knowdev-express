/* eslint-disable no-underscore-dangle */
const { UnavailableError, UnhandledError } = require("@knowdev/errors");
const { envBoolean } = require("@knowdev/functions");
const log = require("@knowdev/log");

const decorateResponse = require("../util/decorateResponse.util");
const summarizeRequest = require("../util/summarizeRequest.util");
const summarizeResponse = require("../util/summarizeResponse.util");

//
//
// Function Definition
//

/**
 *
 * @param {Function} handler
 * @param {Object} options
 * @param {string} options.name
 * @returns {Function}
 */
function projectHandler(
  handler,
  {
    name = undefined,
    unavailable = envBoolean("PROJECT_UNAVAILABLE", { defaultValue: false }),
    version = process.env.PROJECT_VERSION,
  } = {}
) {
  //
  //
  // Validate
  //
  // * Nothing. Maybe in the future a validation function will be passed in

  //
  //
  // Setup
  //

  return (req, res, ...params) => {
    // Set req.locals if it doesn't exist
    if (!req.locals) req.locals = {};
    if (!req.locals._projectHandler) req.locals._projectHandler = {};

    // Set res.locals if it doesn't exist
    if (!res.locals) res.locals = {};
    if (!res.locals._projectHandler) res.locals._projectHandler = {};

    // Set up a local variable to track what we've logged
    if (!req.locals._projectHandler.loggedTraceMode) {
      req.locals._projectHandler.loggedTraceMode = true;
      log.trace("Project logging in trace mode");
    }

    try {
      // Log request
      if (!req.locals._projectHandler.loggedRequestInfo) {
        req.locals._projectHandler.loggedRequestInfo = true;
        log.info.var({ req: summarizeRequest(req) });
      }

      //
      //
      // Preprocess
      //

      // Save the original res.json()
      const originalJson = res.json;
      // Declare a hideous local variable
      let responseJson;
      // Add logging to res.json()
      res.json = (json) => {
        if (!res.locals._projectHandler.decoratedResponse) {
          log.trace("Preparing response");
          responseJson = json; // Populate our disgusting variable
          res.locals._projectHandler.decoratedResponse = true;
          decorateResponse(res, { name, version });
          log.trace("Sending response");
        }
        originalJson.call(res, json); // Call the original res.json()
      };

      // Listen for response finish
      res.on("finish", () => {
        if (!req.locals._projectHandler.loggedResponseInfo) {
          req.locals._projectHandler.loggedResponseInfo = true;
          log.trace("Response finish event");
          log.info.var({ res: summarizeResponse(res, { body: responseJson }) });
        }
      });

      //
      //
      // Process
      //

      // Check available
      if (unavailable) {
        log.warn(
          "Project unavailable: either PROJECT_UNAVAILABLE=true or { unavailable: true } was passed to projectHandler"
        );
        log.debug("Intentionally throwing unavailable");
        throw UnavailableError();
      }

      // Invoke handler
      log.trace(`Handler call {name:${name}}`);
      handler(req, res, ...params);
      log.trace(`Handler exit {name:${name}}`);

      //
      //
      // Postprocess
      //

      //
      //
      // Error Handling
      //
    } catch (error) {
      // if project error
      if (error.isProjectError) {
        log.trace("Caught ProjectError");
        log.trace.var({ projectError: error });
        res.status(error.status).json(error.json());
      } else {
        // otherwise, respond as unhandled
        log.trace("Caught unhandled error");
        log.fatal.var({ unhandledError: error });
        const responseError = UnhandledError();
        res.status(responseError.status).json(responseError.json());
      }
    }
  };
}

//
//
// Export
//

module.exports = projectHandler;
