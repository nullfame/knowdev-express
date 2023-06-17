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
  describe("Decorating headers", () => {
    it("Returns when no headers object is present", () => {
      const res = {};
      decorateResponse(res);
      expect(res.headers).toBeUndefined();
    });
    it.todo("Adds the project invoke");
  });
});
