const MockExpressResponse = require("mock-express-response");

//
//
// Mock constants
//

const MOCK = {
  NAME: "MOCK_NAME",
  VERSION: "MOCK_VERSION",
};

//
//
// Mock modules
//

const mockDecorateResponse = jest.fn();
jest.mock(
  "../decorateResponse.util",
  () =>
    (res, { handler = undefined, version = undefined } = {}) => {
      // res.locals = { ...res.locals, name, version }; // This was co-pilot's suggestion but I didn't use it
      mockDecorateResponse(res, { handler, version });
    }
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
  jest.clearAllMocks();
});

//
//
// Run tests
//

describe("Project handler function", () => {
  let projectHandler;
  beforeEach(() => {
    projectHandler = require("../projectHandler.module"); // eslint-disable-line global-require
  });
  describe("Passing handler context to decorate response", () => {
    it("Handler name can be passed in", () => {
      const mockFunction = jest.fn(async (req, res) => res.json({}));
      const handler = projectHandler(mockFunction, { name: MOCK.NAME });
      const req = {};
      const res = new MockExpressResponse();
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockDecorateResponse).toHaveBeenCalledTimes(1);
      expect(mockDecorateResponse.mock.calls[0][1]).toContainKey("handler");
      expect(mockDecorateResponse.mock.calls[0][1].handler).toEqual(MOCK.NAME);
    });
    it("Handler version can be passed in", () => {
      const mockFunction = jest.fn(async (req, res) => res.json({}));
      const handler = projectHandler(mockFunction, {
        version: MOCK.VERSION,
      });
      const req = {};
      const res = new MockExpressResponse();
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockDecorateResponse).toHaveBeenCalledTimes(1);
      expect(mockDecorateResponse.mock.calls[0][1]).toContainKey("version");
      expect(mockDecorateResponse.mock.calls[0][1].version).toEqual(
        MOCK.VERSION
      );
    });
    it("Handler version can come from the environment", () => {
      process.env.PROJECT_VERSION = MOCK.VERSION;
      const mockFunction = jest.fn(async (req, res) => res.json({}));
      const handler = projectHandler(mockFunction);
      const req = {};
      const res = new MockExpressResponse();
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockDecorateResponse).toHaveBeenCalledTimes(1);
      expect(mockDecorateResponse.mock.calls[0][1]).toContainKey("version");
      expect(mockDecorateResponse.mock.calls[0][1].version).toEqual(
        MOCK.VERSION
      );
    });
  });
});
