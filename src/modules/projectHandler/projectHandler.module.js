/* eslint-disable no-underscore-dangle */
const { UnavailableError, UnhandledError } = require("@knowdev/errors");
const { envBoolean } = require("@knowdev/functions");

const decorateResponse = require("./decorateResponse.util");
const logUtil = require("../../util/log.util");
const summarizeRequest = require("../../util/summarizeRequest.util");
const summarizeResponse = require("../../util/summarizeResponse.util");

//
//
// Helper Functions
//

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

  if (!name) {
    // If handler has a name, use it
    if (handler.name) {
      name = handler.name; // eslint-disable-line no-param-reassign
    }
  }

  //
  //
  // Setup
  //

  return (req, res, ...params) => {
    // * This is the first line of code that runs when a request is received

    // Initialization - e.g., logUtil.init()

    // Set req.locals if it doesn't exist
    if (!req.locals) req.locals = {};
    if (!req.locals._projectHandler) req.locals._projectHandler = {};

    // Set res.locals if it doesn't exist
    if (!res.locals) res.locals = {};
    if (!res.locals._projectHandler) res.locals._projectHandler = {};

    let log;

    // Set up a local variable to track what we've logged
    if (!req.locals._projectHandler.initLogging) {
      req.locals._projectHandler.initLogging = true;
      logUtil.init();
      // logUtil.with will clone logger with the new tag
      log = logUtil.with("handler", name);
      log.trace("Project logging in trace mode");
    }

    // In theory it is impossible to get here without a logger
    if (!log) {
      log = logUtil.with("handler", name);
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
      if (!res.locals._projectHandler.originalJson) {
        res.locals._projectHandler.originalJson = res.json;
        // Add logging to res.json()
        res.json = (json) => {
          if (!res.locals._projectHandler.decoratedResponse) {
            log.trace("Preparing response");
            res.locals._projectHandler.logResponseBodyJson = json; // Populate our disgusting variable
            res.locals._projectHandler.decoratedResponse = true;
            decorateResponse(res, { handler: name, version });
          }
          log.trace("Sending response");
          res.locals._projectHandler.originalJson.call(res, json); // Call the original res.json()
        };
      }

      // Listen for response finish
      res.on("finish", () => {
        if (!req.locals._projectHandler.loggedResponseInfo) {
          req.locals._projectHandler.loggedResponseInfo = true;
          log.trace("Response finish event");
          log.info.var({
            res: summarizeResponse(res, {
              body: res.locals._projectHandler.logResponseBodyJson,
            }),
          });
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
