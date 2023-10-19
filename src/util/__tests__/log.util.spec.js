/* eslint-disable global-require */

const { LOG_FORMAT, LOG_LEVEL } = jest.requireActual("@knowdev/log");

//
//
// Mock constants
//

// eslint-disable-next-line no-unused-vars
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

jest.mock("@knowdev/log", () => {
  // eslint-disable-next-line no-shadow
  const log = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    var: jest.fn(),
    tag: jest.fn(),
    untag: jest.fn(),
    with: jest.fn(() => log),
  };
  log.trace.var = jest.fn();
  log.debug.var = jest.fn();
  log.info.var = jest.fn();
  log.warn.var = jest.fn();
  log.error.var = jest.fn();
  log.fatal.var = jest.fn();
  // eslint-disable-next-line no-shadow
  const { LOG_FORMAT, LOG_LEVEL } = jest.requireActual("@knowdev/log");
  return {
    Logger: jest.fn(() => log),
    LOG_FORMAT: {
      JSON: LOG_FORMAT.JSON,
    },
    LOG_LEVEL: {
      TRACE: LOG_LEVEL.TRACE,
    },
    mockFunctions: log,
  };
});

jest.mock(
  "../../modules/projectHandler/getCurrentInvokeUuid.adapter",
  () => () => "1234abcd-5678-efgh-9012-ijklmnopqrst"
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

describe("Log util", () => {
  it("Has log.trace and log.var", () => {
    const logUtil = require("../log.util"); // eslint-disable-line global-require
    expect(logUtil).toBeObject();
    expect(logUtil.trace).toBeFunction();
    expect(logUtil.var).toBeFunction();
  });
  it("Instantiates a logger when required", () => {
    // * The logger CANNOT have runtime information
    jest.resetModules();
    const logPackage = require("@knowdev/log");
    // Requiring log.util will run the setup routine
    require("../log.util");
    expect(logPackage.Logger).toHaveBeenCalled();
    expect(logPackage.Logger).toHaveBeenCalledWith({
      format: LOG_FORMAT.JSON,
      level: LOG_LEVEL.TRACE,
    });
  });
  it("Tags environment on init", () => {
    process.env.PROJECT_COMMIT = MOCK.COMMIT;
    process.env.PROJECT_ENV = MOCK.ENV;
    process.env.PROJECT_KEY = MOCK.PROJECT;
    jest.resetModules();
    const logPackage = require("@knowdev/log");
    const log = require("../log.util");
    log.init();
    expect(logPackage.mockFunctions.tag).toHaveBeenCalled();
    expect(logPackage.mockFunctions.tag).toHaveBeenCalledWith({
      commit: MOCK.COMMIT,
      env: MOCK.ENV,
      invoke: MOCK.INVOKE,
      project: MOCK.PROJECT,
      shortInvoke: MOCK.INVOKE.slice(0, 8),
      version: process.env.npm_package_version,
    });
  });
});
