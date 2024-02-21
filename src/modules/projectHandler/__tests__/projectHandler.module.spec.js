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

jest.mock("../../../util/log.util"); // manually mocked in __mocks__

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
    it("Will catch an unhandled thrown async error", async () => {
      const mockFunction = jest
        .fn()
        .mockRejectedValueOnce(new Error("Sorpresa!"));
      const handler = projectHandler(mockFunction);
      const req = {};
      const mockResJson = jest.fn();
      const mockResStatus = jest.fn(() => ({ json: mockResJson }));
      const res = {
        json: mockResJson,
        on: jest.fn(),
        status: mockResStatus,
      };
      const next = () => {};
      await handler(req, res, next);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockResStatus).toHaveBeenCalledTimes(1);
      expect(mockResJson).toHaveBeenCalledTimes(1);
      // Expect mockResStatus' first call to be internal error
      expect(mockResStatus.mock.calls[0][0]).toBe(HTTP.CODE.INTERNAL_ERROR);
      const response = mockResJson.mock.calls[0][0];
      expect(response).toMatchSchema(jsonApiErrorSchema);
      expect(response.errors[0].status).toBe(HTTP.CODE.INTERNAL_ERROR);
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
    it("Calls the log init function", () => {
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction);
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const next = () => {};
      handler(req, res, next);
      expect(log.init).toHaveBeenCalled();
    });
    it("Logging works", () => {
      const mockFunction = jest.fn();
      const handler = projectHandler(mockFunction);
      const req = {};
      const res = {
        on: jest.fn(),
      };
      const next = () => {};
      handler(req, res, next);
      expect(log.mockLog).toHaveBeenCalled();
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
  });
  describe("Features", () => {
    describe("Validate", () => {
      it("Calls validate functions in order", async () => {
        const mockFunction = jest.fn();
        const mockValidateOne = jest.fn();
        const mockValidateTwo = jest.fn();
        const handler = projectHandler(mockFunction, {
          validate: [mockValidateOne, mockValidateTwo],
        });
        const req = {};
        const res = {
          on: jest.fn(),
        };
        const next = () => {};
        await handler(req, res, next);
        expect(mockFunction).toHaveBeenCalledTimes(1);
        expect(mockValidateOne).toHaveBeenCalled();
        expect(mockValidateTwo).toHaveBeenCalled();
        expect(mockValidateOne).toHaveBeenCalledBefore(mockValidateTwo);
        expect(mockValidateOne).toHaveBeenCalledBefore(mockFunction);
      });
      it("Handles any thrown errors", async () => {
        const mockFunction = jest.fn();
        const mockValidateError = jest.fn(() => {
          throw new Error("Sorpresa!");
        });
        const mockValidateOne = jest.fn();
        const mockValidateTwo = jest.fn();
        const handler = projectHandler(mockFunction, {
          validate: [mockValidateOne, mockValidateError, mockValidateTwo],
        });
        const req = {};
        const res = {
          json: jest.fn(),
          on: jest.fn(),
          status: jest.fn(() => res),
        };
        const next = () => {};
        await handler(req, res, next);
        expect(mockFunction).toHaveBeenCalledTimes(0);
        expect(mockValidateOne).toHaveBeenCalled();
        expect(mockValidateError).toHaveBeenCalled();
        expect(mockValidateTwo).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP.CODE.INTERNAL_ERROR);
      });
    });
    describe("Setup", () => {
      it("Calls setup functions in order", async () => {
        const mockFunction = jest.fn();
        const mockSetupOne = jest.fn();
        const mockSetupTwo = jest.fn();
        const handler = projectHandler(mockFunction, {
          setup: [mockSetupOne, mockSetupTwo],
        });
        const req = {};
        const res = {
          on: jest.fn(),
        };
        const next = () => {};
        await handler(req, res, next);
        expect(mockFunction).toHaveBeenCalledTimes(1);
        expect(mockSetupOne).toHaveBeenCalled();
        expect(mockSetupTwo).toHaveBeenCalled();
        expect(mockSetupOne).toHaveBeenCalledBefore(mockSetupTwo);
        expect(mockSetupOne).toHaveBeenCalledBefore(mockFunction);
      });
      it("Handles any thrown errors", async () => {
        const mockFunction = jest.fn();
        const mockSetupError = jest.fn(() => {
          throw new Error("Sorpresa!");
        });
        const mockSetupOne = jest.fn();
        const mockSetupTwo = jest.fn();
        const handler = projectHandler(mockFunction, {
          setup: [mockSetupOne, mockSetupError, mockSetupTwo],
        });
        const req = {};
        const res = {
          json: jest.fn(),
          on: jest.fn(),
          status: jest.fn(() => res),
        };
        const next = () => {};
        await handler(req, res, next);
        expect(mockFunction).toHaveBeenCalledTimes(0);
        expect(mockSetupOne).toHaveBeenCalled();
        expect(mockSetupError).toHaveBeenCalled();
        expect(mockSetupTwo).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP.CODE.INTERNAL_ERROR);
      });
    });
    describe("Teardown", () => {
      it("Calls teardown functions in order", async () => {
        const mockFunction = jest.fn();
        const mockTeardownOne = jest.fn();
        const mockTeardownTwo = jest.fn();
        const handler = projectHandler(mockFunction, {
          teardown: [mockTeardownOne, mockTeardownTwo],
        });
        const req = {};
        const res = {
          on: jest.fn(),
        };
        const next = () => {};
        await handler(req, res, next);
        expect(mockFunction).toHaveBeenCalledTimes(1);
        expect(mockTeardownOne).toHaveBeenCalled();
        expect(mockTeardownTwo).toHaveBeenCalled();
        expect(mockTeardownOne).toHaveBeenCalledBefore(mockTeardownTwo);
        expect(mockTeardownOne).toHaveBeenCalledAfter(mockFunction);
      });
      it("Calls all functions even on error", async () => {
        const mockFunction = jest.fn();
        const mockTeardownError = jest.fn(() => {
          throw new Error("Sorpresa!");
        });
        const mockTeardownOne = jest.fn();
        const mockTeardownTwo = jest.fn();
        const handler = projectHandler(mockFunction, {
          teardown: [mockTeardownOne, mockTeardownError, mockTeardownTwo],
        });
        const req = {};
        const res = {
          json: jest.fn(),
          on: jest.fn(),
          status: jest.fn(() => res),
        };
        const next = () => {};
        await handler(req, res, next);
        expect(mockFunction).toHaveBeenCalledTimes(1);
        expect(mockTeardownOne).toHaveBeenCalled();
        expect(mockTeardownError).toHaveBeenCalled();
        expect(mockTeardownTwo).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP.CODE.INTERNAL_ERROR);
      });
      it.todo(
        "Will call teardown functions even if the handler throws an error"
      );
    });
    describe("Locals", () => {
      it.todo("Populates req.locals");
      it.todo("Handles any thrown errors");
    });
  });
});
