const HTTP = require("@knowdev/http");
const { InternalError, UnhandledError } = require("@knowdev/errors");

const express = require("express");
const { matchers } = require("jest-json-schema");
const request = require("supertest");

const router = require("../echo.route");
const log = require("../../util/log.util");
const jsonApiErrorSchema = require("../../etc/jsonApiError.schema");

//
//
// Configuration
//

expect.extend(matchers);

const schema = {
  type: "object",
  properties: {
    invoke: { type: "string" },
    req: {
      type: "object",
      properties: {
        baseUrl: { type: "string" },
        headers: { type: "object" },
        method: { type: "string" },
        params: { type: "object" },
        query: { type: "object" },
        url: { type: "string" },
      },
      required: ["baseUrl"],
    },
  },
};

//
//
// Test constants
//

const TEST = {
  BODY: {
    STRING: "Hello.",
  },
};

//
//
// Mock modules
//

// TODO: abstract mocking the log

const mockLog = jest.fn();
jest.mock("../../util/log.util", () => {
  // eslint-disable-next-line no-shadow
  const log = {
    trace: jest.fn((...args) => mockLog("trace", ...args)),
    debug: jest.fn((...args) => mockLog("debug", ...args)),
    info: jest.fn((...args) => mockLog("info", ...args)),
    warn: jest.fn((...args) => mockLog("warn", ...args)),
    error: jest.fn((...args) => mockLog("error", ...args)),
    fatal: jest.fn((...args) => mockLog("fatal", ...args)),
    var: jest.fn((...args) => mockLog("var", ...args)),
    tag: jest.fn(),
    untag: jest.fn(),
    with: jest.fn(() => log),
  };
  log.trace.var = jest.fn((...args) => mockLog("trace.var", ...args));
  log.debug.var = jest.fn((...args) => mockLog("debug.var", ...args));
  log.info.var = jest.fn((...args) => mockLog("info.var", ...args));
  log.warn.var = jest.fn((...args) => mockLog("warn.var", ...args));
  log.error.var = jest.fn((...args) => mockLog("error.var", ...args));
  log.fatal.var = jest.fn((...args) => mockLog("fatal.var", ...args));
  return log;
});

//
//
// Mock environment
//

const route = express();
route.use(router);

const DEFAULT_ENV = process.env;
beforeEach(() => {
  process.env = { ...process.env };
});
afterEach(() => {
  process.env = DEFAULT_ENV;
  jest.clearAllMocks();
});

//
//
// Run tests
//

describe("Express Backend", () => {
  describe("Echo router", () => {
    it("Works", async () => {
      const res = await request(route).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeObject();
      // baseUrl is an empty string because of the mock setup
      // We don't care about this value in test
      // In production it is probably "/echo"
      expect(res.body.req.baseUrl).toEqual("");
    });
    describe("Validate various responses", () => {
      it("GET /", async () => {
        const res = await request(route).get("/");
        // Validate the response
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchSchema(schema);
        // Check the values
        expect(res.body.req.url).toEqual("/");
        expect(res.body.req.method).toEqual("GET");
        expect(res.body.req.query).toEqual({});
      });
      it("GET /path?with=query&more", async () => {
        const res = await request(route).get("/path?with=query&more");
        // Validate the response
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchSchema(schema);
        // Check the values
        // Is the baseUrl an empty string because of our mock setup?
        expect(res.body.req.baseUrl).toEqual("");
        expect(res.body.req.url).toEqual("/path?with=query&more");
        expect(res.body.req.method).toEqual("GET");
        expect(res.body.req.query).toEqual({
          with: "query",
          more: "",
        });
      });
      it("POST /", async () => {
        const res = await request(route).post("/").send(TEST.BODY.STRING);
        // Validate the response
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchSchema(schema);
        // Check the values
        expect(res.body.req.url).toEqual("/");
        expect(res.body.req.method).toEqual("POST");
        expect(res.body.req.body).toEqual(TEST.BODY.STRING);
      });
      it("POST / (empty)", async () => {
        const res = await request(route).post("/");
        // Validate the response
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchSchema(schema);
        // Check the values
        expect(res.body.req.url).toEqual("/");
        expect(res.body.req.method).toEqual("POST");
        expect(res.body.req.body).toEqual({}); // it converts empty body to an empty object
      });
    });
    describe("Special case routes", () => {
      it("Responds with a 400", async () => {
        const res = await request(route).get("/error/400");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.BAD_REQUEST);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 401", async () => {
        const res = await request(route).get("/error/401");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.UNAUTHORIZED);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 403", async () => {
        const res = await request(route).get("/error/403");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.FORBIDDEN);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 404", async () => {
        const res = await request(route).get("/error/404");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.NOT_FOUND);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 418", async () => {
        const res = await request(route).get("/error/418");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.TEAPOT);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 500 Internal Error", async () => {
        const res = await request(route).get("/error/500");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.INTERNAL_ERROR);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
        const sample = new InternalError();
        expect(res.body.errors[0].title).toEqual(sample.title);
        expect(res.body.errors[0].detail).toEqual(sample.detail);
      });
      it("Responds with a 500 Unhandled Error", async () => {
        const res = await request(route).get("/error/unhandled");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.INTERNAL_ERROR);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
        const sample = new UnhandledError();
        expect(res.body.errors[0].title).toEqual(sample.title);
        expect(res.body.errors[0].detail).toEqual(sample.detail);
      });
      it("Responds with a 502", async () => {
        const res = await request(route).get("/error/502");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.BAD_GATEWAY);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 503", async () => {
        const res = await request(route).get("/error/503");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.UNAVAILABLE);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
      it("Responds with a 504", async () => {
        const res = await request(route).get("/error/504");
        // Validate the response
        expect(res.statusCode).toEqual(HTTP.CODE.GATEWAY_TIMEOUT);
        expect(res.body).toMatchSchema(jsonApiErrorSchema);
      });
    });
    describe("Logging routes", () => {
      it("Standard routes do not log error, fatal, or warning", async () => {
        await request(route).get("/");
        expect(log.trace).toHaveBeenCalled();
        expect(log.error).not.toHaveBeenCalled();
        expect(log.fatal).not.toHaveBeenCalled();
        expect(log.warn).not.toHaveBeenCalled();
      });
      it.todo("Logs an error");
      it.todo("Logs fatal");
      it.todo("Logs a warning");
    });
  });
});
