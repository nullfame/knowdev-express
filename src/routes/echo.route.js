console.log("Entering echo.route.js");

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

console.log("echo.route.js: require log.util");
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
  projectHandler(
    () => {
      throw new BadRequestError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/401",
  projectHandler(
    () => {
      throw new UnauthorizedError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/403",
  projectHandler(
    () => {
      throw new ForbiddenError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/404",
  projectHandler(
    () => {
      throw new NotFoundError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/418",
  projectHandler(
    () => {
      throw new TeapotError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/500",
  projectHandler(
    () => {
      throw new InternalError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/502",
  projectHandler(
    () => {
      throw new BadGatewayError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/503",
  projectHandler(
    () => {
      throw new UnavailableError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/504",
  projectHandler(
    () => {
      throw new GatewayTimeoutError();
    },
    { name: "error" }
  )
);

router.all(
  "/error/unhandled",
  projectHandler(
    () => {
      throw new Error("Mock Unhandled Exception");
    },
    { name: "error" }
  )
);

// Last error catch all route
router.all(
  "/error/*",
  projectHandler(
    () => {
      throw new NotFoundError();
    },
    { name: "error" }
  )
);

//
//
// Logging Routes
//

router.all(
  "/log/error",
  projectHandler(
    (req, res) => {
      log.error("Logging test error");
      res.json({ message: "Logged test error" });
    },
    { name: "log" }
  )
);

router.all(
  "/log/fatal",
  projectHandler(
    (req, res) => {
      log.fatal("Logging test fatal");
      res.json({ message: "Logged test fatal" });
    },
    { name: "log" }
  )
);

router.all(
  "/log/warn",
  projectHandler(
    (req, res) => {
      console.log("log :>> ", log);
      console.log("echo.route.js: /log/warn");
      // TODO: here, log does not have handler, invoke, shortInvoke, or version
      log.warn("Logging test warn");
      res.json({ message: "Logged test warn" });
    },
    { name: "log" }
  )
);

router.all(
  "/log/both",
  projectHandler(
    (req, res) => {
      log.warn("Logging test warn");
      log.error("Logging test error");
      res.json({ message: "Logged test warn and error" });
    },
    { name: "log" }
  )
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

console.log("echo.route.js: module.exports");
module.exports = router;
