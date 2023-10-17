const log = require("../log.util");

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
    expect(log).toBeObject();
    expect(log.trace).toBeFunction();
    expect(log.var).toBeFunction();
  });
  // TODO: Mock new Logger and make sure the tags come through
  it.todo("Tags environment");
});
