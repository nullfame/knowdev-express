# KnowDev Express 🚅

Express on AWS Lambda toolkit

## ℹ️ Overview

Encapsulates KnowDev opinions on JSON:API, logging, and debugging

* `projectHandler()` function should wrap all routes
* The handler will bootstrap logging provided by `@knowdev/log`
* The handler will catch any `@knowdev/errors` and respond properly
* The handler will catch any uncaught errors and respond with a `500` (from `@knowdev/errors`)

## 📋 Usage

### Installation

``` bash
npm install --save @knowdev/express
```

### Environment Variables

For [@knowdev/log](https://github.com/nullfame/knowdev-log)):

``` bash
LOG_LEVEL=all|trace|*debug*|info|warn|error|fatal|silent
```

### Example

``` javascript
const { log, projectHandler } = require("@knowdev/express");

router.all(
  "*",
  projectHandler((req, res) => {
    log.debug("Entering my handler logic");
    const response = { hello: "world" };
    res.json(response);
  })
);

module.exports = router;
```

## 📖 Reference

### Project Handler

``` javascript
const { projectHandler } = require("@knowdev/express");

const myRouteHandler = projectHandler((req, res) => {
    const response = { hello: "world" };
    res.json(response);
});

router.all("*", myRouteHandler);
```

### Logging

``` javascript
const { log } = require("@knowdev/express");

// Log by level
log.trace();
log.debug();
log.info();
log.warn();
log.error();
log.fatal();

// Special log variables:
log.var({ response });

// Chain for different levels:
log.trace.var({ response });
log.debug.var({ response }); // Default
log.info.var({ response });
log.warn.var({ response });
log.error.var({ response });
log.fatal.var({ response });
```

Learn more at [@knowdev/log](https://github.com/nullfame/knowdev-log)

### Routes

#### echoRoute

``` javascript
const express = require("express");
const { echoRoute } = require("@knowdev/express");

const app = express();
app.use("/echo", echoRoute);
app.use("/echo/*", echoRoute);
```

Responds by echoing back details of your original submission, helpful for debugging

### Functions

#### summarizeRequest

Summarizes the request, for the debugging.  Used by the echo route

``` javascript
const { summarizeRequest } = require("@knowdev/express");

log.var({ req: summarizeRequest(req) })
```

## 📝 Changelog

* v0.1.0: fork from separate project (echoRoute, log, projectHandler, summarizeRequest)

## 🛣 Roadmap

### Wishlist 🌠

## 📜 License

All rights reserved. Safe for use around pets
