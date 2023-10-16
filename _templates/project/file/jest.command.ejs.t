---
inject: true
to: package.json
after: scripts
skip_if: test:spec:<%= type %>:<%= name %>
sh: npm run format:package
---
    "test:spec:<%= type %>:<%= name %>": "jest ./<%= path %>/__tests__/<%= name %>.spec.js",
