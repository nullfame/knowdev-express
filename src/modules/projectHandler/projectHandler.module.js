/* eslint-disable no-underscore-dangle */
const { UnavailableError, UnhandledError } = require("@knowdev/errors");
const { envBoolean } = require("@knowdev/functions");

const decorateResponse = require("./decorateResponse.util");
const logger = require("../../util/log.util");
const summarizeRequest = require("../../util/summarizeRequest.util");
const summarizeResponse = require("../../util/summarizeResponse.util");
const getCurrentInvokeUuid = require("./getCurrentInvokeUuid.adapter");

//
//
// Helper Functions
//

function getEnvironmentTags() {
  const tags = {};

  // Commit
  if (process.env.PROJECT_COMMIT) {
    tags.commit = process.env.PROJECT_COMMIT;
  }

  // Environment
  if (process.env.PROJECT_ENV) {
    tags.env = process.env.PROJECT_ENV;
  }

  // Invoke
  const invoke = getCurrentInvokeUuid();
  if (invoke) {
    tags.invoke = invoke;
    // Short invoke is first 8 characters
    tags.shortInvoke = invoke.slice(0, 8);
  }

  // Project
  if (process.env.PROJECT_KEY) {
    tags.project = process.env.PROJECT_KEY;
  }

  // Version
  if (process.env.npm_package_version || process.env.PROJECT_VERSION) {
    tags.version =
      process.env.npm_package_version || process.env.PROJECT_VERSION;
  }

  return tags;
}

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
    // Set req.locals if it doesn't exist
    if (!req.locals) req.locals = {};
    if (!req.locals._projectHandler) req.locals._projectHandler = {};

    // Set res.locals if it doesn't exist
    if (!res.locals) res.locals = {};
    if (!res.locals._projectHandler) res.locals._projectHandler = {};

    // logger.with will clone logger with the new tag
    const log = logger.with("handler", name);

    // Set up a local variable to track what we've logged
    if (!req.locals._projectHandler.initLogging) {
      req.locals._projectHandler.initLogging = true;
      log.tag(getEnvironmentTags());
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
      if (!res.locals._projectHandler.originalJson) {
        res.locals._projectHandler.originalJson = res.json;
        // Add logging to res.json()
        res.json = (json) => {
          if (!res.locals._projectHandler.decoratedResponse) {
            log.trace("Preparing response");
            res.locals._projectHandler.logResponseBodyJson = json; // Populate our disgusting variable
            res.locals._projectHandler.decoratedResponse = true;
            decorateResponse(res, { name, version });
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
