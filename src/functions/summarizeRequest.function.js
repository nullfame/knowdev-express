//
//
// Function Definition
//

function summarizeRequest(req) {
  return {
    baseUrl: req.baseUrl,
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
    url: req.url,
  };
}

//
//
// Export
//

module.exports = summarizeRequest;
