const getCurrentInvokeUuid = require("../getCurrentInvokeUuid.adapter");

//
//
// Mock constants
//

const MOCK = {
  UUID: "MOCK_UUID",
};

//
//
// Mock modules
//

jest.mock("@vendia/serverless-express", () => ({
  getCurrentInvoke: jest.fn(() => ({
    context: {
      awsRequestId: MOCK.UUID,
    },
  })),
}));

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

describe("GetCurrentInvokeUuid util", () => {
  it("Works", () => {
    expect(getCurrentInvokeUuid).toBeFunction();
    const response = getCurrentInvokeUuid();
    expect(response).not.toBeUndefined();
  });
  it("Returns the mocked UUID", () => {
    const response = getCurrentInvokeUuid();
    expect(response).toBe(MOCK.UUID);
  });
});
