const log = require("@knowdev/log");

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
    log.error("decorateResponse util called but response is not an object");
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
    // Preprocess
    //

    //
    //
    // Process
    //
    res.set("X-Powered-By", "KnowDev");

    //
    //
    // Postprocess
    //

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
