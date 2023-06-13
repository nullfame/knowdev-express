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
  it("Works", async () => {
    expect(projectHandler).toBeDefined();
    expect(projectHandler).toBeFunction();
  });
  it("Will call a function I pass it", () => {
    const mockFunction = jest.fn();
    const handler = projectHandler(mockFunction);
    const req = {};
    const res = {};
    const next = () => {};
    handler(req, res, next);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
