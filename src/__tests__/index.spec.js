/* eslint-disable global-require */

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

describe("@knowdev/express exports", () => {
  it("Loads XD", () => {
    const index = require("..");
    expect(index).toBeDefined();
  });
  describe("", () => {
    let index;
    let projectHandler;
    beforeAll(() => {
      jest.resetModules();
      index = require("..");
      projectHandler = index.projectHandler;
    });
    describe("Project handler smoke test", () => {
      it("Will call a function I pass it", () => {
        expect(projectHandler).toBeFunction();
        expect(projectHandler).toBe(
          jest.requireActual("../modules/").projectHandler
        );
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
});
