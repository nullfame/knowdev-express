const log = require("../log.util");

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

describe("Log util", () => {
  it("Has log.trace and log.var", () => {
    expect(log).toBeObject();
    expect(log.trace).toBeFunction();
    expect(log.var).toBeFunction();
  });
});
