---
to: <%= path %>/__tests__/<%= name %>.spec.js
---
const <%= name %> = require("../<%= name %>");

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

describe("<%= Name %>", () => {
  it("Works", async () => {
    const response = await <%= name %>();
    console.log("response :>> ", response);
    expect(response).not.toBeUndefined();
  });
});
