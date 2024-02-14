export { default } from './powerpod.js';
import { Environment, Form, doc, win } from './common/constants.js';
import { getEnv } from './common/env.js';
import { Logger } from './common/logger.js';
import { getOptions } from './common/options.js';
import { initJQueryAdapter } from './jquery-adapter.js';

const logger = Logger('app');

function autoinit() {
  logger.info({
    fn: autoinit,
    message: `starting autoinit, href: ${win.location.href}`,
  });
  const { host, pathname: path } = win.location;

  // TODO: auto-detect environment based on host URL
  // for now manually configure these options:
  const env = getEnv() || Environment.DEV;

  // ensure that powerpod is allowed to run in the current env
  if (!getOptions().allowedEnvs.includes(env)) {
    logger.error({
      fn: autoinit,
      message: `current environment is not in list of allowed environments, env: ${env}, allowedEnvs:`,
      data: getOptions().allowedEnvs,
    });
    return;
  }

  // ensure that current host is in the list of allowed hosts in options
  if (!getOptions().allowedHosts.includes(host)) {
    logger.error({
      fn: autoinit,
      message: `current host is not in list of allowed hosts, host: ${host}, allowedHosts:`,
      data: getOptions().allowedHosts,
    });
    return;
  }

  // ensure current path is in the list of allowed paths from options
  if (
    !getOptions().allowedPaths.some((allowedPath) => path.includes(allowedPath))
  ) {
    logger.error({
      fn: autoinit,
      message: `current path is not in list of allowed paths, path: ${path}, allowedPaths:`,
      data: getOptions().allowedPaths,
    });
    return;
  }

  const options = {
    env,
    logLevel: ENV_LOG_LEVEL[env],
  };
  logger.info({
    fn: autoinit,
    message: 'calling powerpod jQuery handler with options:',
    data: options,
  });
  // @ts-ignore
  $.fn.powerpod(options);
}

async function start() {
  try {
    logger.info({
      fn: start,
      message: 'initializing jQuery adapter...',
    });
    const successMsg = await initJQueryAdapter();
    logger.info({
      fn: start,
      message: successMsg,
    });
  } catch (errorMsg) {
    logger.error({
      fn: start,
      message: errorMsg,
    });
    throw new Error(errorMsg);
  }

  if (!getOptions().autoinit) {
    logger.info({
      fn: start,
      message: 'skipping autoinit, not configured in options',
    });
    return;
  }

  autoinit();
}

(function () {
  logger.info({ message: 'checking for jQuery...' });
  // @ts-ignore
  if (win.jQuery) {
    logger.info({ message: 'jQuery found, running start...' });
    start();
  } else if (doc.readyState === 'complete') {
    logger.info({
      message:
        'jQuery not found, but should be present at this point, running start...',
    });
    start();
  } else if (doc.addEventListener) {
    logger.info({
      message: 'jQuery not found, adding listener for document ready state...',
    });
    doc.addEventListener('readystatechange', () => {
      switch (doc.readyState) {
        case 'loading':
          logger.info({
            message:
              'document.readyState: ' +
              doc.readyState +
              `- The document is still loading.`,
          });
          break;
        case 'interactive':
          logger.info({
            message:
              'document.readyState: ' +
              doc.readyState +
              `- The document has finished loading DOM. ` +
              `- "DOMContentLoaded" event`,
          });
          break;
        case 'complete':
          logger.info({
            message:
              'document.readyState: ' +
              doc.readyState +
              `- The page DOM with Sub-resources are now fully loaded. ` +
              `- "load" event`,
          });
          logger.info({ message: 'document load complete, running start...' });
          start();
          break;
      }
    });
  } else if (win) {
    logger.info({
      message:
        'jQuery not found AND doc.addEventListener not found, adding listener for window loaded state...',
    });
    win.addEventListener('load', () => {
      start();
    });
  } else {
    logger.error({
      message: 'issue initializing app!',
    });
  }
})();
