import { win } from './constants.js';
import { getOptions } from './options.js';

const LogType = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const LogLevel = {
  [LogType.INFO]: 10,
  [LogType.WARN]: 20,
  [LogType.ERROR]: 90,
};

function log({ namespace, fn, level, message, data }) {
  const { logging: enableLogging } = getOptions();
  if (!win.console || !win.console[level])
    win.console.error('[POWERPOD]: issue using logger');

  const logFn = win.console[level]; // default log

  let prefix = '';
  prefix += namespace ? ` (${namespace})` : '';
  prefix += fn && typeof fn === 'function' && fn.name ? ` ${fn.name}` : '';

  if (enableLogging) {
    logFn('[POWERPOD]' + prefix + ': ' + message);
    if (data && typeof data === 'object') logFn(data);
  }
}

export function Logger(namespace = null) {
  return {
    info: ({ fn = null, message, data = null }) =>
      log({ namespace, fn, level: LogType.INFO, message, data }),
    error: ({ fn = null, message, data = null }) =>
      log({ namespace, fn, level: LogType.ERROR, message, data }),
    warn: ({ fn = null, message, data = null }) =>
      log({ namespace, fn, level: LogType.WARN, message, data }),
  };
}
