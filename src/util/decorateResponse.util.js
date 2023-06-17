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

  //
  //
  // Setup
  //

  //
  //
  // Preprocess
  //

  //
  //
  // Process
  //

  //
  //
  // Postprocess
  //

  //
  //
  // Return
  //
};

//
//
// Export
//

module.exports = decorateResponse;
