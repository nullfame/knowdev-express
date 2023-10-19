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
// Constants
//

const ROUTE = {
  NAME: {
    ECHO: "echo",
    ERROR: "error",
    LOG: "log",
  },
};

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
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/401",
  projectHandler(
    () => {
      throw new UnauthorizedError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/403",
  projectHandler(
    () => {
      throw new ForbiddenError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/404",
  projectHandler(
    () => {
      throw new NotFoundError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/418",
  projectHandler(
    () => {
      throw new TeapotError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/500",
  projectHandler(
    () => {
      throw new InternalError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/502",
  projectHandler(
    () => {
      throw new BadGatewayError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/503",
  projectHandler(
    () => {
      throw new UnavailableError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/504",
  projectHandler(
    () => {
      throw new GatewayTimeoutError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

router.all(
  "/error/unhandled",
  projectHandler(
    () => {
      throw new Error("Mock Unhandled Exception");
    },
    { name: ROUTE.NAME.ERROR }
  )
);

// Last error catch all route
router.all(
  "/error/*",
  projectHandler(
    () => {
      throw new NotFoundError();
    },
    { name: ROUTE.NAME.ERROR }
  )
);

//
//
// Logging Routes
//

// TODO: function to provide logger with handler name
function echoRouteLogger() {
  return log.with({ handler: ROUTE.NAME.LOG });
}

router.all(
  "/log/error",
  projectHandler(
    (req, res) => {
      echoRouteLogger().error("Logging test error");
      res.json({ message: "Logged test error" });
    },
    { name: ROUTE.NAME.LOG }
  )
);

router.all(
  "/log/fatal",
  projectHandler(
    (req, res) => {
      echoRouteLogger().fatal("Logging test fatal");
      res.json({ message: "Logged test fatal" });
    },
    { name: ROUTE.NAME.LOG }
  )
);

router.all(
  "/log/warn",
  projectHandler(
    (req, res) => {
      echoRouteLogger().warn("Logging test warn");
      res.json({ message: "Logged test warn" });
    },
    { name: ROUTE.NAME.LOG }
  )
);

router.all(
  "/log/both",
  projectHandler(
    (req, res) => {
      echoRouteLogger().warn("Logging test warn");
      echoRouteLogger().error("Logging test error");
      res.json({ message: "Logged test warn and error" });
    },
    { name: ROUTE.NAME.LOG }
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
    { name: ROUTE.NAME.ECHO }
  )
);

//
//
// Export
//

module.exports = router;
