import { Environment, win, POWERPOD } from './constants.js';
import { getOptions } from './options.js';

POWERPOD.logger = {
  Logger,
  log,
};

const Type = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const Level = {
  [Type.INFO]: 10,
  [Type.WARN]: 20,
  [Type.ERROR]: 90,
};

function log({ namespace, fn, type, message, data }) {
  const logLevel = Level[type];
  const { logging: enableLogging, logLevel: envLogLevel } = getOptions();

  // if logging is disabled entirely, exit early
  if (!enableLogging) return;

  // if level of requested log is less than log level of env, do not log
  if (logLevel < envLogLevel) return;

  if (!win.console || !win.console[type]) {
    win.console.error('[POWERPOD]: issue using logger');
    return;
  }

  const logFn = win.console[type]; // default log

  let prefix = '';
  prefix += namespace ? ` (${namespace})` : '';
  prefix += fn && typeof fn === 'function' && fn.name ? ` ${fn.name}` : '';

  logFn('[POWERPOD]' + prefix + ': ' + message);
  if (data && typeof data === 'object') logFn(data);
}

export function Logger(namespace = null) {
  return {
    info: ({ fn = null, message, data = null }) =>
      log({ namespace, fn, type: Type.INFO, message, data }),
    error: ({ fn = null, message, data = null }) =>
      log({ namespace, fn, type: Type.ERROR, message, data }),
    warn: ({ fn = null, message, data = null }) =>
      log({ namespace, fn, type: Type.WARN, message, data }),
  };
}
