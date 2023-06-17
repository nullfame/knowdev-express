const MockExpressResponse = require("mock-express-response");
const decorateResponse = require("../decorateResponse.util");

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
    it("Adds the project invoke", () => {
      const res = new MockExpressResponse();
      decorateResponse(res);
    });
  });
});
