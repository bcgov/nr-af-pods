import { ApplicationPaths, ClaimPaths, Form, win } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/application');

export function getFormType() {
  const { pathname: path } = win.location;
  if (ClaimPaths.some((claimPath) => path.includes(claimPath))) {
    logger.info({
      fn: getFormType,
      message: `auto-detected ${Form.Claim} form`,
    });
    return Form.Claim;
  } else if (ApplicationPaths.some((appPath) => path.includes(appPath))) {
    logger.info({
      fn: getFormType,
      message: `auto-detected ${Form.Application} form`,
    });
    return Form.Application;
  } else {
    logger.error({
      fn: getFormType,
      message: `Unable to autodetect form type, path: ${path}`,
    });
  }
}
