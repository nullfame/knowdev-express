const HTTP = require("@knowdev/http");
const httpRoute = require("../httpRoute.function");

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
// Mock modules
//

const mockProjectHandler = jest.fn();

jest.mock("../../modules", () => ({
  ...jest.requireActual("../../modules"),
  projectHandler: (...params) => mockProjectHandler(...params),
}));

//
//
// Run tests
//

describe("HTTP route function", () => {
  describe("Passes context through to project handler", () => {
    it("Passes through context", async () => {
      const context = { name: "MOCK_NAME" };
      // Call our route-making function with some context
      httpRoute(HTTP.CODE.NO_CONTENT, context);
      // Expect the project handler to have been called with the context
      expect(mockProjectHandler).toHaveBeenCalledTimes(1);
      expect(mockProjectHandler.mock.calls[0][1]).toEqual(context);
    });
  });
});
