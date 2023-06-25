const HTTP = require("@knowdev/http");

const express = require("express");
const request = require("supertest");

const httpRoute = require("../httpRoute.function");

//
//
// Mock environment
//

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
  it.todo("Returns 200 by default");
  it.todo("Passes through context");
  it.todo("Returns 200 on request");
  it.todo("Returns 204");
  it.todo("Returns 400");
  it.todo("Returns 403");
  it.todo("Returns 404");
  it.todo("Returns 410");
  it.todo("Returns 500");
  it.todo("Returns 502");
  it.todo("Returns 503");
  it.todo("Returns 504");
  it.todo("Returns whatever you tell it");
  it.todo("Warns when it cannot map a message");
});
