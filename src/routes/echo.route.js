const log = require("@knowdev/log");

const bodyParser = require("body-parser");
const express = require("express");
const { getCurrentInvoke } = require("@vendia/serverless-express");

const projectHandler = require("../functions/projectHandler.function");
const summarizeRequest = require("../functions/summarizeRequest.function");

const router = express.Router();

//
//
// Middleware
//

// Body parser
router.use(bodyParser.text({ type: "*/*" }));

//
//
// Echo Route (all others)
//

router.all(
  "*",
  projectHandler((req, res) => {
    //
    //
    // Setup Response Object
    //

    const response = {
      req: summarizeRequest(req),
    };

    //
    //
    // Decorate Response
    //

    // Invoke
    const currentInvoke = getCurrentInvoke();
    if (
      currentInvoke &&
      currentInvoke.context &&
      currentInvoke.context.awsRequestId
    ) {
      response.invoke = currentInvoke.context.awsRequestId;
      res.setHeader("X-Project-Invoke", response.invoke);
    }

    //
    //
    // Respond as JSON
    //

    res.json(response);
  })
);

//
//
// Export
//

module.exports = router;
