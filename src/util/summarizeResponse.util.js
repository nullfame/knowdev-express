//
//
// Function Definition
//

function summarizeResponse(res, extras) {
  return {
    headers: res.getHeaders(),
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    ...extras,
  };
}

//
//
// Export
//

module.exports = summarizeResponse;
