const HTTP = require("@knowdev/http");

const express = require("express");
const { matchers } = require("jest-json-schema");
const request = require("supertest");

const httpRoute = require("../httpRoute.function");
const jsonApiErrorSchema = require("../../etc/jsonApiError.schema");
const log = require("../../util/log.util");

//
//
// Mock environment
//

expect.extend(matchers);

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

describe("HTTP route function", () => {
  it("Is a function", () => {
    expect(httpRoute).toBeFunction();
  });
  it("Returns a function", () => {
    const handler = httpRoute(HTTP.CODE.NO_CONTENT);
    expect(handler).toBeFunction();
  });
  it("Works", async () => {
    // Setup express to use our route
    const app = express();
    const route = httpRoute();
    app.use(route);
    // Make a request
    const res = await request(app).get("/");
    // Check the response
    expect(res.body).not.toBeUndefined();
  });
  it("Sets the powered-by header", async () => {
    // Setup express to use our route
    const app = express();
    const route = httpRoute();
    app.use(route);
    // Make a request
    const res = await request(app).get("/");
    // Check the response
    expect(res.headers["x-powered-by"]).toEqual("knowdev.studio");
  });
  it("Returns 200 by default", async () => {
    // Setup express to use our route
    const app = express();
    const route = httpRoute();
    app.use(route);
    // Make a request
    const res = await request(app).get("/");
    // Check the response
    expect(res.statusCode).toEqual(HTTP.CODE.OK);
  });
  describe("Fully supports many default statuses", () => {
    const statuses = [
      HTTP.CODE.OK,
      HTTP.CODE.NO_CONTENT,
      HTTP.CODE.BAD_REQUEST,
      HTTP.CODE.UNAUTHORIZED,
      HTTP.CODE.FORBIDDEN,
      HTTP.CODE.NOT_FOUND,
      HTTP.CODE.GONE,
      HTTP.CODE.TEAPOT,
      HTTP.CODE.INTERNAL_ERROR,
      HTTP.CODE.BAD_GATEWAY,
      HTTP.CODE.UNAVAILABLE,
      HTTP.CODE.GATEWAY_TIMEOUT,
    ];
    statuses.forEach((status) => {
      it(`Returns ${status} on request`, async () => {
        // Setup express to use our route
        const app = express();
        const route = httpRoute(status);
        app.use(route);
        // Make a request
        const res = await request(app).get("/");
        // Check the response
        expect(res.statusCode).toEqual(status);
      });
      if (status >= 400) {
        it(`Returns a JSON:API-complaint ${status} error`, async () => {
          // Setup express to use our route
          const app = express();
          const route = httpRoute(status);
          app.use(route);
          // Make a request
          const res = await request(app).get("/");
          // Check the response schema
          expect(res.body).toMatchSchema(jsonApiErrorSchema);
        });
      }
    });
  });
  it("Returns whatever you tell it", async () => {
    // Setup express to use our route
    const app = express();
    const route = httpRoute(201);
    app.use(route);
    // Make a request
    const res = await request(app).get("/");
    // Check the response
    expect(res.statusCode).toEqual(201);
  });
  describe("Logging and observability", () => {
    beforeEach(() => {
      // Spy on log.warn
      jest.spyOn(log, "warn");
    });
    afterEach(() => {
      // Release the spy
      log.warn.mockRestore();
    });
    it("Warns when it cannot map a message", async () => {
      // Setup express to use our route
      const app = express();
      const route = httpRoute(299);
      app.use(route);
      // Make a request
      const res = await request(app).get("/");
      // Check the response
      expect(res.statusCode).toEqual(299);
      // Check the log
      expect(log.warn).toHaveBeenCalledTimes(1);
      // The _exact_ message doesn't matter, but we should start with @knowdev/express for now
      expect(log.warn).toHaveBeenCalledWith(
        "@knowdev/express: status code 299 not found in statusMessage map"
      );
    });
    it("Warns when it is an error that cannot be thrown", async () => {
      // Setup express to use our route
      const app = express();
      const route = httpRoute(499);
      app.use(route);
      // Make a request
      const res = await request(app).get("/");
      // Check the response
      expect(res.statusCode).toEqual(499);
      expect(log.warn).toHaveBeenCalledTimes(2);
      // The _exact_ message doesn't matter, but we should start with @knowdev/express for now
      expect(log.warn).toHaveBeenNthCalledWith(
        1,
        "@knowdev/express: status code 499 not mapped as throwable"
      );
      expect(log.warn).toHaveBeenNthCalledWith(
        2,
        "@knowdev/express: status code 499 not found in statusMessage map"
      );
    });
  });
});
