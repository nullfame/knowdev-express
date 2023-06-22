---
to: src/<%= subtypes %>/__tests__/<%= name %>.<%= subtype %>.spec.js
---
const <%= name %> = require("../<%= name %>.<%= subtype %>");

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

describe("<%= Name %> <%= subtype %>", () => {
  it("Works", () => {
    expect(<%= name %>).toBeFunction();
    const response = <%= name %>();
    console.log("response :>> ", response);
    expect(response).not.toBeUndefined();
  });
});
