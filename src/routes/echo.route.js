const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TeapotError,
  BadGatewayError,
  UnavailableError,
  GatewayTimeoutError,
  InternalError,
  UnauthorizedError,
} = require("@knowdev/errors");

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
// Error Routes
//

router.all(
  "/error/400",
  projectHandler(() => {
    throw new BadRequestError();
  })
);

router.all(
  "/error/401",
  projectHandler(() => {
    throw new UnauthorizedError();
  })
);

router.all(
  "/error/403",
  projectHandler(() => {
    throw new ForbiddenError();
  })
);

router.all(
  "/error/404",
  projectHandler(() => {
    throw new NotFoundError();
  })
);

router.all(
  "/error/418",
  projectHandler(() => {
    throw new TeapotError();
  })
);

router.all(
  "/error/500",
  projectHandler(() => {
    throw new InternalError();
  })
);

router.all(
  "/error/502",
  projectHandler(() => {
    throw new BadGatewayError();
  })
);

router.all(
  "/error/503",
  projectHandler(() => {
    throw new UnavailableError();
  })
);

router.all(
  "/error/504",
  projectHandler(() => {
    throw new GatewayTimeoutError();
  })
);

router.all(
  "/error/unhandled",
  projectHandler(() => {
    throw new Error("Mock Unhandled Exception");
  })
);

// Last error catch all route
router.all(
  "/error/*",
  projectHandler(() => {
    throw new NotFoundError();
  })
);

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
