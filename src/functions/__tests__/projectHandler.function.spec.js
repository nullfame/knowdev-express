const { NotFoundError } = require("@knowdev/errors");
const { matchers } = require("jest-json-schema");

const projectHandler = require("../projectHandler.function");

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
    const res = {
      on: jest.fn(),
    };
    const next = () => {};
    handler(req, res, next);
    expect(mockFunction).toHaveBeenCalledTimes(1);
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
    it.todo(
      "Will respond with a 503 if process.env.PROJECT_UNAVAILABLE is set to true"
    );
    it.todo(
      "Will respond with a 503 if unavailable=true is passed to the handler"
    );
  });
});
