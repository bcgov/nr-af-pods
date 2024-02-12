import * as utils from './common/utils.js';
import { POWERPOD, win, doc, Form } from './common/constants.js';
import powerpod from './powerpod.js';
import { getOptions } from './common/options.js';
import { Logger } from './common/logger.js';

const logger = Logger('jquery-adapter');

/**
 * jQuery adapter for powerpod.js
 */
export async function initJQueryAdapter() {
  logger.info({
    fn: initJQueryAdapter,
    message: 'initializing jQuery adapter...',
  });
  // @ts-ignore
  let successMsg;
  if (win.jQuery) {
    (function ($, powerpod) {
      'use strict';

      // No jQuery No Go
      if (!$ || !powerpod) {
        const errorMsg = 'jQuery is required to use the jQuery powerpod!';
        logger.error({
          fn: initJQueryAdapter,
          message: errorMsg,
        });
        return Promise.reject(errorMsg);
      }

      $.fn.powerpod = function (options) {
        options = $.extend({}, options, { $: $ });
        logger.info({
          message: '$.fn.powerpod was called with options:',
          data: options,
        });

        // Initialize
        powerpod(options);

        logger.info({
          message: 'creating the $.fn.powerpod object from POWERPOD:',
          data: POWERPOD,
        });
        Object.keys(POWERPOD).forEach(function (key) {
          getOptions().$.fn.powerpod[key] = POWERPOD[key];
        });
      };
      successMsg = 'successfully initialized jQuery adapter...';
      logger.info({
        fn: initJQueryAdapter,
        message: successMsg,
      });
      return;
      // @ts-ignore
    })(win.jQuery, powerpod);
  } else {
    const errorMsg = 'jQuery is required to use the jQuery powerpod!';
    logger.error({
      fn: initJQueryAdapter,
      message: errorMsg,
    });
    return Promise.reject(errorMsg);
  }
  // if we made it here, it's a success!
  return Promise.resolve(successMsg);
}
