global.window = window;
global.$ = require('jquery');
global.console = {
  // Keep native behaviour for methods
  info: console.info,
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
};
