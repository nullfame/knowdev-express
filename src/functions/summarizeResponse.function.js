//
//
// Function Definition
//

function summarizeResponse(res) {
  console.log("res :>> ", res);
  return {
    body: res.body,
    taco: "hi",
    locals: res.locals,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
  };
}

//
//
// Export
//

module.exports = summarizeResponse;
