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

const { projectHandler } = require("../modules");
const log = require("../util/log.util");
const summarizeRequest = require("../util/summarizeRequest.util");

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
// Logging Routes
//

router.all(
  "/log/error",
  projectHandler((req, res) => {
    log.error("Logging test error");
    res.json({ message: "Logged test error" });
  })
);

router.all(
  "/log/fatal",
  projectHandler((req, res) => {
    log.fatal("Logging test fatal");
    res.json({ message: "Logged test fatal" });
  })
);

router.all(
  "/log/warn",
  projectHandler((req, res) => {
    log.warn("Logging test warn");
    res.json({ message: "Logged test warn" });
  })
);

router.all(
  "/log/both",
  projectHandler((req, res) => {
    log.warn("Logging test warn");
    log.error("Logging test error");
    res.json({ message: "Logged test warn and error" });
  })
);

//
//
// Echo Route (all others)
//

router.all(
  "*",
  projectHandler(
    (req, res) => {
      //
      //
      // Setup Response Object
      //

      const response = {
        req: summarizeRequest(req),
      };

      //
      //
      // Respond as JSON
      //

      res.json(response);
    },
    { name: "echo" }
  )
);

//
//
// Export
//

module.exports = router;
