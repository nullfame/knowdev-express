const express = require("express");
const { matchers } = require("jest-json-schema");
const request = require("supertest");

const router = require("../echo.route");

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
    });
  });
});
