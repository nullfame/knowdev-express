const { UnhandledError } = require("@knowdev/errors");
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
  { name = undefined, version = process.env.PROJECT_VERSION } = {}
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

  return (req, res, next, ...params) => {
    log.trace("Project logging in trace mode");
    try {
      // Log request
      log.info.var({ req: summarizeRequest(req) });

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
        log.trace("Preparing response");
        responseJson = json; // Populate our disgusting variable
        decorateResponse(res, { name, version });
        log.trace("Sending response");
        originalJson.call(res, json); // Call the original res.json()
      };

      // Listen for response finish
      res.on("finish", () => {
        log.trace("Response finish event");
        log.info.var({ res: summarizeResponse(res, { body: responseJson }) });
      });

      //
      //
      // Process
      //

      // Invoke handler
      log.trace("Handler call");
      handler(req, res, ...params);
      log.trace("Handler exit");

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
