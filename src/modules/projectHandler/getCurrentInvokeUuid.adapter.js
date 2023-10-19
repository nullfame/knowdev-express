console.log("Entering getCurrentInvokeUuid.adapter.js");

const { getCurrentInvoke } = require("@vendia/serverless-express");

//
//
// Constants
//

//
//
// Helper Functions
//

// Adapter for the "@vendia/serverless-express" uuid
function getServerlessExpressUuid() {
  console.log("getCurrentInvokeUuid.adapter.js: getServerlessExpressUuid");
  const currentInvoke = getCurrentInvoke();
  console.log("currentInvoke :>> ", currentInvoke);
  if (
    currentInvoke &&
    currentInvoke.context &&
    currentInvoke.context.awsRequestId
  ) {
    return currentInvoke.context.awsRequestId;
  }
  return undefined;
}

//
//
// Main
//

const getCurrentInvokeUuid = () => getServerlessExpressUuid();

//
//
// Export
//

module.exports = getCurrentInvokeUuid;
