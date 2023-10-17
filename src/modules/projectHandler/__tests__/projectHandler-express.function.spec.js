const express = require("express");
const request = require("supertest");

const decorateResponse = require("../decorateResponse.util");
const log = require("../../../util/log.util");
const projectHandler = require("../projectHandler.module");

//
//
// Mock constants
//

//
//
// Mock modules
//

// TODO: abstract mocking the log

const mockLog = jest.fn();
jest.mock("../../../util/log.util", () => {
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

// Mock decorate response
jest.mock("../decorateResponse.util");

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
  jest.resetModules();
  jest.clearAllMocks();
});

//
//
// Run tests
//

describe("Project handler function", () => {
  describe("In an express context", () => {
    it("Can be called once", async () => {
      // Spy on log.info
      jest.spyOn(log, "info");
      log.info.var = jest.fn();
      // Set up our mock function
      const mockFunction = jest.fn((req, res) =>
        res.json({
          goose: "honk",
        })
      );
      const handler = projectHandler(mockFunction, {
        name: "handler",
      });
      // Set up our mock express app
      const app = express();
      app.use(handler);
      // Make a request
      const res = await request(app).get("/");
      expect(res.body).toEqual({ goose: "honk" });
      // Check the log was called twice: once for the request, once for the response
      expect(log.info.var).toBeCalledTimes(2);
      // Both calls should be an object with a single key: "req" or "res"
      expect(log.info.var.mock.calls[0][0]).toHaveProperty("req");
      expect(log.info.var.mock.calls[1][0]).toHaveProperty("res");
      expect(log.info.var.mock.calls[1][0].res.body).toEqual({ goose: "honk" });
      // The count of keys in each call should be 1
      expect(Object.keys(log.info.var.mock.calls[0][0]).length).toEqual(1);
      expect(Object.keys(log.info.var.mock.calls[1][0]).length).toEqual(1);
      // Expect decorateResponse to have been called once
      expect(decorateResponse).toBeCalledTimes(1);
      // Release the spy
      delete log.info.var; // Not necessary, but clear
      log.info.mockRestore();
    });
    it("Can be called twice", async () => {
      // Spy on log.info
      jest.spyOn(log, "info");
      log.info.var = jest.fn();
      // Set up our mock function
      const mockFunctionOne = jest.fn((req, res, next) => {
        next();
      });
      const mockFunctionTwo = jest.fn((req, res) => {
        res.json({
          goose: "honk",
        });
      });
      const handlerOne = projectHandler(mockFunctionOne, {
        name: "handlerOne",
      });
      const handlerTwo = projectHandler(mockFunctionTwo, {
        name: "handlerTwo",
      });
      // Set up our mock express app
      const app = express();
      app.use(handlerOne, handlerTwo);
      // Make a request
      const res = await request(app).get("/");
      expect(res.body).toEqual({ goose: "honk" });
      // Check the log was called twice: once for the request, once for the response
      expect(log.info.var).toBeCalledTimes(2);
      // Both calls should be an object with a single key: "req" or "res"
      expect(log.info.var.mock.calls[0][0]).toHaveProperty("req");
      expect(log.info.var.mock.calls[1][0]).toHaveProperty("res");
      expect(log.info.var.mock.calls[1][0].res.body).toEqual({ goose: "honk" });
      // The count of keys in each call should be 1
      expect(Object.keys(log.info.var.mock.calls[0][0]).length).toEqual(1);
      expect(Object.keys(log.info.var.mock.calls[1][0]).length).toEqual(1);
      // Expect decorateResponse to have been called once
      expect(decorateResponse).toBeCalledTimes(1);
      // Release the spy
      delete log.info.var; // Not necessary, but clear
      log.info.mockRestore();
    });
  });
});
