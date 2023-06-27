const log = require("@knowdev/log");

const express = require("express");
const request = require("supertest");

const decorateResponse = require("../../util/decorateResponse.util");
const projectHandler = require("../projectHandler.function");

//
//
// Mock constants
//

//
//
// Mock modules
//

// Mock decorate response
jest.mock("../../util/decorateResponse.util");

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
        console.log("mockFunctionOne reporting; calling next()");
        next();
        console.log("next() returned; mockFunctionOne exiting");
      });
      const mockFunctionTwo = jest.fn((req, res) => {
        console.log("mockFunctionTwo reporting; sending response");
        res.json({
          goose: "honk",
        });
        console.log("response sent; mockFunctionTwo exiting");
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
