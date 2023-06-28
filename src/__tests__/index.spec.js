const index = require("..");
const { projectHandler } = require("..");

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

describe("@knowdev/express exports", () => {
  it("Exports projectHandler", () => {
    expect(index.projectHandler).toBe(projectHandler);
    expect(projectHandler).toBeFunction();
  });
  describe("Project handler smoke test", () => {
    it("Will call a function I pass it", () => {
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction);
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });
});
