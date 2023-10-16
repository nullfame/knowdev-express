const { NotFoundError } = require("@knowdev/errors");
const HTTP = require("@knowdev/http");

const { matchers } = require("jest-json-schema");

const log = require("../../../util/log.util");
const projectHandler = require("../projectHandler.module");

//
//
// Configuration
//

expect.extend(matchers);

const jsonApiErrorSchema = {
  type: "object",
  properties: {
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          status: { type: "number" },
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["status", "title"],
      },
    },
  },
  required: ["errors"],
};

//
//
// Mock constants
//

const MOCK = {
  COMMIT: "MOCK_COMMIT",
  ENV: "MOCK_ENV",
  INVOKE: "1234abcd-5678-efgh-9012-ijklmnopqrst",
  PROJECT: "MOCK_PROJECT",
};

//
//
// Mock modules
//

// TODO: abstract mocking the log

const mockLog = jest.fn();
jest.mock("../../../util/log.util", () => {
  // eslint-disable-next-line no-shadow
  const log = {
    trace: jest.fn((...args) => mockLog("trace", ...args)),
    debug: jest.fn((...args) => mockLog("debug", ...args)),
    info: jest.fn((...args) => mockLog("info", ...args)),
    warn: jest.fn((...args) => mockLog("warn", ...args)),
    error: jest.fn((...args) => mockLog("error", ...args)),
    fatal: jest.fn((...args) => mockLog("fatal", ...args)),
    var: jest.fn((...args) => mockLog("var", ...args)),
    tag: jest.fn(),
    untag: jest.fn(),
    with: jest.fn(() => log),
  };
  log.trace.var = jest.fn((...args) => mockLog("trace.var", ...args));
  log.debug.var = jest.fn((...args) => mockLog("debug.var", ...args));
  log.info.var = jest.fn((...args) => mockLog("info.var", ...args));
  log.warn.var = jest.fn((...args) => mockLog("warn.var", ...args));
  log.error.var = jest.fn((...args) => mockLog("error.var", ...args));
  log.fatal.var = jest.fn((...args) => mockLog("fatal.var", ...args));
  return log;
});

jest.mock("../getCurrentInvokeUuid.adapter", () => () => MOCK.INVOKE);

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
  it("Works", async () => {
    expect(projectHandler).toBeDefined();
    expect(projectHandler).toBeFunction();
  });
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
  it("Passes req, res, and anything else to the handler", () => {
    // Set up four mock variables
    const req = {};
    const res = {
      on: jest.fn(),
    };
    const three = "THREE";
    const four = "FOUR";
    // Set up our mock function
    const mockFunction = jest.fn();
    const handler = projectHandler(mockFunction);
    // Call the handler with our mock variables
    handler(req, res, three, four);
    // Expect the mock function to have been called with our mock variables
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith(req, res, three, four);
  });
  describe("Using project handler in a sequence", () => {
    it("Can be called twice", () => {
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const third = jest.fn();
      const fourth = jest.fn();
      // Set up our mock function
      const mockFunctionOne = jest.fn();
      const mockFunctionTwo = jest.fn();
      const handlerOne = projectHandler(mockFunctionOne, {
        name: "handlerOne",
      });
      const handlerTwo = projectHandler(mockFunctionTwo, {
        name: "handlerTwo",
      });
      // Call each handler with our mock variables
      handlerOne(req, res, third, fourth);
      handlerTwo(req, res, third, fourth);
      // Expect each mock function to have been called with our mock variables
      expect(mockFunctionOne).toHaveBeenCalledTimes(1);
      expect(mockFunctionOne).toHaveBeenCalledWith(req, res, third, fourth);
      expect(mockFunctionTwo).toHaveBeenCalledTimes(1);
      expect(mockFunctionTwo).toHaveBeenCalledWith(req, res, third, fourth);
    });
  });
  describe("Error handling", () => {
    it("Will catch an unhandled thrown error", () => {
      const mockFunction = jest.fn(() => {
        throw new Error("Sorpresa!");
      });
      const handler = projectHandler(mockFunction);
      const req = {};
      const mockResJson = jest.fn();
      const res = {
        json: mockResJson,
        on: jest.fn(),
        status: jest.fn(() => res),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockResJson).toHaveBeenCalledTimes(1);
      const response = mockResJson.mock.calls[0][0];
      expect(response).toMatchSchema(jsonApiErrorSchema);
      expect(response.errors[0].status).toBe(500);
      // The response title will be "Internal Application Error" but we don't want to test that here
      // expect(response.errors[0].title).toBe("Internal Application Error");
    });
    it("Will catch a thrown ProjectError and respond with the correct status code", () => {
      // Mock a function that throws NotFoundError
      const mockFunction = jest.fn(() => {
        throw new NotFoundError();
      });
      const handler = projectHandler(mockFunction);
      const req = {};
      const mockResJson = jest.fn();
      const res = {
        json: mockResJson,
        on: jest.fn(),
        status: jest.fn(() => res),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockResJson).toHaveBeenCalledTimes(1);
      const response = mockResJson.mock.calls[0][0];
      expect(response).toMatchSchema(jsonApiErrorSchema);
      expect(response.errors[0].status).toBe(404);
    });
  });
  describe("Unavailable mode", () => {
    it("Works as normal when process.env.PROJECT_UNAVAILABLE is set to false", () => {
      process.env.PROJECT_UNAVAILABLE = "false";
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction);
      const req = {};
      const mockResJson = jest.fn();
      const res = {
        json: mockResJson,
        on: jest.fn(),
        status: jest.fn(() => res),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
    it("Will respond with a 503 if process.env.PROJECT_UNAVAILABLE is set to true", () => {
      process.env.PROJECT_UNAVAILABLE = "true";
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction);
      const req = {};
      const mockResJson = jest.fn();
      const res = {
        json: mockResJson,
        on: jest.fn(),
        status: jest.fn(() => res),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(0);
      expect(mockResJson).toHaveBeenCalledTimes(1);
      const response = mockResJson.mock.calls[0][0];
      expect(response).toMatchSchema(jsonApiErrorSchema);
      expect(response.errors[0].status).toBe(HTTP.CODE.UNAVAILABLE);
    });
    it("Will respond with a 503 if unavailable=true is passed to the handler", () => {
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction, { unavailable: true });
      const req = {};
      const mockResJson = jest.fn();
      const res = {
        json: mockResJson,
        on: jest.fn(),
        status: jest.fn(() => res),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(0);
      expect(mockResJson).toHaveBeenCalledTimes(1);
      const response = mockResJson.mock.calls[0][0];
      expect(response).toMatchSchema(jsonApiErrorSchema);
      expect(response.errors[0].status).toBe(HTTP.CODE.UNAVAILABLE);
    });
  });
  describe("Logging", () => {
    it("Logging works", () => {
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction);
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const next = () => {};
      handler(req, res, next);
      expect(mockLog).toHaveBeenCalled();
      expect(log.trace).toHaveBeenCalled();
      expect(log.info.var).toHaveBeenCalled();
    });
    it("Tags log handler", () => {
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction, { name: "handler" });
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const next = () => {};
      handler(req, res, next);
      expect(log.with).toHaveBeenCalled();
      expect(log.with).toHaveBeenCalledWith("handler", "handler");
    });
    it("Tags environment", () => {
      process.env.PROJECT_COMMIT = MOCK.COMMIT;
      process.env.PROJECT_ENV = MOCK.ENV;
      process.env.PROJECT_KEY = MOCK.PROJECT;
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction, { name: "handler" });
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const next = () => {};
      handler(req, res, next);
      expect(log.tag).toHaveBeenCalledWith({
        commit: MOCK.COMMIT,
        env: MOCK.ENV,
        invoke: MOCK.INVOKE,
        project: MOCK.PROJECT,
        shortInvoke: MOCK.INVOKE.slice(0, 8),
        version: process.env.npm_package_version,
      });
    });
  });
});
