global.window = window;
global.$ = require('jquery');
global.console = {
  info: jest.fn(), // console.info are ignored in tests
  
  // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
};
