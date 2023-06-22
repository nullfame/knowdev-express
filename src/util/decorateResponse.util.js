const HTTP = require("@knowdev/http");
const log = require("@knowdev/log");

const getCurrentInvokeUuid = require("./adapters/getCurrentInvokeUuid.adapter");

//
//
// Constants
//

//
//
// Helper Functions
//

//
//
// Main
//

/**
 *
 * @param { import("express").Response } res
 * @param { * } context
 * @returns
 */
const decorateResponse = (res, { handler = "", version = "" } = {}) => {
  //
  //
  // Validate
  //
  if (typeof res !== "object" || res === null) {
    log.warn("decorateResponse called but response is not an object");
    return; // eslint-disable-line no-useless-return
  }

  try {
    //
    //
    // Setup
    //
    log.trace("Decorating response");

    //
    //
    // Decorate Headers
    //

    // X-Powered-By, override "Express" but nothing else
    if (
      !res.get(HTTP.HEADER.POWERED_BY) ||
      res.get(HTTP.HEADER.POWERED_BY) === "Express"
    ) {
      res.set(HTTP.HEADER.POWERED_BY, "knowdev.studio");
    }

    // X-Project-Environment
    if (process.env.PROJECT_ENVIRONMENT) {
      res.setHeader(
        HTTP.HEADER.PROJECT.ENVIRONMENT,
        process.env.PROJECT_ENVIRONMENT
      );
    }

    // X-Project-Handler
    if (handler) {
      res.setHeader(HTTP.HEADER.PROJECT.HANDLER, handler);
    }

    // X-Project-Invocation
    const currentInvoke = getCurrentInvokeUuid();
    if (currentInvoke) {
      res.setHeader(HTTP.HEADER.PROJECT.INVOCATION, currentInvoke);
    }

    // X-Project-Key
    if (process.env.PROJECT_KEY) {
      res.setHeader(HTTP.HEADER.PROJECT.KEY, process.env.PROJECT_KEY);
    }

    // X-Project-Version
    if (version) {
      res.setHeader(HTTP.HEADER.PROJECT.VERSION, version);
    }

    //
    //
    // Error Handling
    //
  } catch (error) {
    log.warn("decorateResponse caught an internal error");
    log.var({ error });
  }
};

//
//
// Export
//

module.exports = decorateResponse;

//
//
// Footnotes
//

// This is a "utility" function but it needs a lot of "context"
// about the environment's secret parameters, the special adapter,
// HTTP, etc.  There must be a better way to organize this
