const HTTP = require("@knowdev/http"); // eslint-disable-line no-unused-vars

const express = require("express");
const request = require("supertest");

const projectHandler = require("../projectHandler.function");

//
//
// Mock constants
//

//
//
// Mock modules
//

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
});

//
//
// Run tests
//

describe("Project handler function", () => {
  describe("In an express context", () => {
    it("Can be called once", async () => {
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
    });
    it("Can be called twice", async () => {
      // Set up our mock function
      const mockFunctionOne = jest.fn((req, res, next) => {
        console.log("mockFunctionOne reporting; calling next()");
        next();
      });
      const mockFunctionTwo = jest.fn((req, res) => {
        console.log("mockFunctionTwo reporting; sending response");
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
    });
  });
});
