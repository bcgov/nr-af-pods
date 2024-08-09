import { POWERPOD, doc } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/loading');

/**
 * Hides the loading animation by removing the div and the styling element.
 * Note: The styles hide the page content & display the loader, so removing
 * it simply hides the animation & displays page content. The div and header
 * are defined in the page & HTML in Portal Management (MS Dynamics 365).
 * @function
 */
export function hideLoadingAnimation() {
  logger.info({
    fn: hideLoadingAnimation,
    message: 'attempting to hide loading animation...',
  });

  if (POWERPOD.doNotUnhideLoader) {
    logger.info({
      fn: hideLoadingAnimation,
      message:
        'abort unhiding due to POWERPOD.doNotUnhideLoader flag set to true',
    });
    return;
  }

  POWERPOD.loading = false;
  const loader = doc.getElementById('loader');
  if (loader) {
    logger.info({
      fn: hideLoadingAnimation,
      message: 'loader found & finished loading, removing element',
    });
    loader.parentNode?.removeChild(loader);
  } else {
    logger.warn({
      fn: hideLoadingAnimation,
      message: 'loader not found!',
    });
  }

  const loaderStyle = doc.getElementById('loader-style');
  if (loaderStyle) {
    logger.info({
      fn: hideLoadingAnimation,
      message: 'loaderStyle found & finished loading, removing element',
    });
    loaderStyle.parentNode?.removeChild(loaderStyle);
  } else {
    logger.warn({
      fn: hideLoadingAnimation,
      message: 'loaderStyle not found!',
    });
  }
}
