const HTTP = require("@knowdev/http");

const express = require("express");
const { matchers } = require("jest-json-schema");
const request = require("supertest");

const httpRoute = require("../httpRoute.function");
const jsonApiErrorSchema = require("../../etc/jsonApiError.schema");

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

describe("HttpRoute function", () => {
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
  it.todo("Passes through context");
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
  it.todo("Warns when it cannot map a message");
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
});
