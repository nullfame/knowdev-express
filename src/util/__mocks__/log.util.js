const mockLog = jest.fn();

const log = {
  trace: jest.fn((...args) => mockLog("trace", ...args)),
  debug: jest.fn((...args) => mockLog("debug", ...args)),
  info: jest.fn((...args) => mockLog("info", ...args)),
  warn: jest.fn((...args) => mockLog("warn", ...args)),
  error: jest.fn((...args) => mockLog("error", ...args)),
  fatal: jest.fn((...args) => mockLog("fatal", ...args)),
  var: jest.fn((...args) => mockLog("var", ...args)),
  init: jest.fn(),
  tag: jest.fn(),
  untag: jest.fn(),
  with: jest.fn(() => log),
};
log.trace.var = jest.fn((...args) => mockLog("trace.var", ...args));
log.debug.var = jest.fn((...args) => mockLog("debug.var", ...args));
log.info.var = jest.fn((...args) => mockLog("info.var", ...args));
log.warn.var = jest.fn((...args) => mockLog("warn.var", ...args));
log.error.var = jest.fn((...args) => mockLog("error.var", ...args));
log.fatal.var = jest.fn((...args) => mockLog("fatal.var", ...args));

log.mockLog = mockLog;

module.exports = log;
