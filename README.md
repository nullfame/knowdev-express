# KnowDev Express 🚅

Express on AWS Lambda toolkit

## ℹ️ Overview

Encapsulates project opinions on JSON:API, logging, and debugging

* `projectHandler()` function should wrap all routes
* The handler will bootstrap logging provided by `@knowdev/log`
* The inbound request will be logged
* The outbound response will be logged
* The outbound response will be decorated with project headers
* The handler will catch any `@knowdev/errors` and respond properly
* The handler will catch any uncaught errors and respond with a `500` (from `@knowdev/errors`)

## 📋 Usage

### Installation

``` bash
npm install --save @knowdev/express
```

### Environment Variables

For [@knowdev/log](https://github.com/nullfame/knowdev-log):

``` bash
LOG_LEVEL=all|trace|*debug*|info|warn|error|fatal|silent

# Project metadata
PROJECT_ENV=dev
PROJECT_KEY=mayhem
PROJECT_VERSION=0.1.0

# Project secret will let tests bypass authentication
PROJECT_SECRET=

# Danger!
PROJECT_UNAVAILABLE=false
```

**⚠️ Danger! Setting `PROJECT_UNAVAILABLE=true` will cause the handler to always throw 503 Unavailable errors.**

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

### Project Headers

The following headers will be included based off the following values:

| Header | Value |
| ------ | ----- |
| X-Powered-By | `knowdev.studio` | 
| X-Project-Environment | `process.env.PROJECT_ENV` | 
| X-Project-Invoke | AWS Lambda invoke UUID | 
| X-Project-Key | `process.env.PROJECT_KEY` | 
| X-Project-Version | `process.env.PROJECT_VERSION` | 

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

Responds by echoing back details of your original submission, helpful for debugging. Some special routes return special messages:

| Route             | Response |
| ----------------- | -------- |
| `error/400`       | Bad request error |
| `error/403`       | Forbidden error |
| `error/404`       | Not found error |
| `error/500`       | Internal error |
| `error/502`       | Bad gateway error |
| `error/503`       | Unavailable error |
| `error/504`       | Gateway timeout error |
| `error/unhandled` | Unhandled error |
| `error/*`         | Not found error |

Note these error routes are in addition to the path you may be using to specify the echo route. If you follow the above example of using `/echo/*`, your full route would be `/echo/error/503`

### Functions

#### summarizeRequest

Summarizes the request, for the debugging.  Used by the echo route

``` javascript
const { summarizeRequest } = require("@knowdev/express");

log.var({ req: summarizeRequest(req) })
```

#### summarizeResponse

Summarizes the response, for the debugging.  Used in logging

``` javascript
const { summarizeResponse } = require("@knowdev/express");

log.var({ res: summarizeResponse(res) })
```

## 📝 Changelog

* v0.3.0: Headers, `PROJECT_UNAVAILABLE`
* v0.2.0: Logging, special echo routes, summarize response
* v0.1.0: fork from separate project (echoRoute, log, projectHandler, summarizeRequest)

## 📜 License

All rights reserved. Safe for use around pets
