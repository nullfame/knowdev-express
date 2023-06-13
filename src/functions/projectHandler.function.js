const { UnhandledError } = require("@knowdev/errors");
const log = require("@knowdev/log");

const summarizeResponse = require("./summarizeResponse.function");

//
//
// Function Definition
//

function projectHandler(handler) {
  log.trace("Project logging in trace mode");
  return (req, res, next, ...params) => {
    try {
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
