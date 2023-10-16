// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = [
  {
    type: "input",
    name: "path",
    message: "Path (e.g., 'src' no leading './' or trailing '/'):",
  },
  {
    type: "input",
    name: "name",
    message: "File name (e.g., 'index'):",
  },
  {
    type: "input",
    name: "type",
    message:
      "Type, for `npm run test:spec:TYPE:NAME` command. Usually a restating of the path with colons instead of slashes (e.g., 'express'):",
  },
];
