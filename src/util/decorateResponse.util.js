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

const decorateResponse = (res) => {
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

    // X-Project-Invocation
    const currentInvoke = getCurrentInvokeUuid();
    if (currentInvoke) {
      res.setHeader(HTTP.HEADER.PROJECT.INVOCATION, currentInvoke);
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
