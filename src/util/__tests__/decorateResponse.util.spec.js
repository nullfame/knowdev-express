const HTTP = require("@knowdev/http");
const MockExpressResponse = require("mock-express-response");
const decorateResponse = require("../decorateResponse.util");

//
//
// Mock constants
//

const MOCK = {
  ENV: "MOCK_ENV",
  HANDLER: "MOCK_HANDLER",
};

//
//
// Mock modules
//

jest.mock("../adapters/getCurrentInvokeUuid.adapter", () =>
  jest.fn(() => "MOCK_UUID")
);

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

describe("Decorate response util", () => {
  it("Works", () => {
    expect(decorateResponse).toBeFunction();
  });
  it("Returns when a non-objects are passed in (or null, which is an object)", () => {
    decorateResponse(undefined);
    decorateResponse("Hello.");
    decorateResponse(42);
    decorateResponse(true);
    decorateResponse(null);
  });
  it("Returns when no headers object is present", () => {
    // No headers object is often passed in mocking and tests
    const res = {};
    decorateResponse(res);
    // Expect res to still be an empty object
    expect(res).toEqual({});
  });
  describe("Decorating headers", () => {
    describe("Project invoke", () => {
      it("Adds the project invoke", () => {
        const res = new MockExpressResponse();
        expect(res.get(HTTP.HEADER.PROJECT.INVOCATION)).toBeUndefined();
        decorateResponse(res);
        expect(res.get(HTTP.HEADER.PROJECT.INVOCATION)).not.toBeUndefined();
      });
    });
    describe("Powered by", () => {
      it("Adds the powered by", () => {
        const res = new MockExpressResponse();
        expect(res.get(HTTP.HEADER.POWERED_BY)).toBeUndefined();
        decorateResponse(res);
        expect(res.get(HTTP.HEADER.POWERED_BY)).toEqual("knowdev.studio");
      });
      it("Adds the powered by and overrides the Express default", () => {
        const res = new MockExpressResponse();
        res.set(HTTP.HEADER.POWERED_BY, "Express");
        expect(res.get(HTTP.HEADER.POWERED_BY)).not.toBeUndefined();
        decorateResponse(res);
        expect(res.get(HTTP.HEADER.POWERED_BY)).toEqual("knowdev.studio");
      });
      it("Will not add powered by if one exists", () => {
        const res = new MockExpressResponse();
        res.set(HTTP.HEADER.POWERED_BY, "Some other value");
        expect(res.get(HTTP.HEADER.POWERED_BY)).not.toBeUndefined();
        decorateResponse(res);
        expect(res.get(HTTP.HEADER.POWERED_BY)).toEqual("Some other value");
      });
    });
    describe("Project environment", () => {
      it("Adds the project environment if it is present", () => {
        process.env.PROJECT_ENVIRONMENT = MOCK.ENV;
        const res = new MockExpressResponse();
        expect(res.get(HTTP.HEADER.PROJECT.ENVIRONMENT)).toBeUndefined();
        decorateResponse(res);
        expect(res.get(HTTP.HEADER.PROJECT.ENVIRONMENT)).not.toBeUndefined();
      });
      it("Does not adds the project environment if it is not present", () => {
        const res = new MockExpressResponse();
        expect(res.get(HTTP.HEADER.PROJECT.ENVIRONMENT)).toBeUndefined();
        decorateResponse(res);
        expect(res.get(HTTP.HEADER.PROJECT.ENVIRONMENT)).toBeUndefined();
      });
    });
    describe("Project handler name", () => {
      it("Adds the project handler if it is present", () => {
        const res = new MockExpressResponse();
        expect(res.get(HTTP.HEADER.PROJECT.HANDLER)).toBeUndefined();
        decorateResponse(res, { handler: MOCK.HANDLER });
        expect(res.get(HTTP.HEADER.PROJECT.HANDLER)).not.toBeUndefined();
      });
      it("Does not adds the project handler if it is not present", () => {
        const res = new MockExpressResponse();
        expect(res.get(HTTP.HEADER.PROJECT.HANDLER)).toBeUndefined();
        decorateResponse(res, {});
        expect(res.get(HTTP.HEADER.PROJECT.HANDLER)).toBeUndefined();
      });
    });
    it.todo("Will return the project key");
    it.todo("Will return the project version");
  });
});
