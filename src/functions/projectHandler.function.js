const { UnhandledError } = require("@knowdev/errors");
const log = require("@knowdev/log");
const summarizeRequest = require("./summarizeRequest.function");
const summarizeResponse = require("./summarizeResponse.function");

//
//
// Function Definition
//

function projectHandler(handler) {
  return (req, res, next, ...params) => {
    log.trace("Project logging in trace mode");
    try {
      // Log request
      log.info.var({ req: summarizeRequest(req) });

      // Save the original res.json()
      const originalJson = res.json;
      // Declare a hideous local variable
      let responseJson;
      // Add logging to res.json()
      res.json = (json) => {
        responseJson = json;
        originalJson.call(res, json);
      };

      // Listen for response finish
      res.on("finish", () => {
        log.trace("Response finish event");
        log.info.var({ res: summarizeResponse(res, { body: responseJson }) });
      });

      // Invoke handler
      log.trace("Handler call");
      handler(req, res, ...params);
      log.trace("Handler exit");
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
