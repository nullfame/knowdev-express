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
  const currentInvoke = getCurrentInvoke();
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
