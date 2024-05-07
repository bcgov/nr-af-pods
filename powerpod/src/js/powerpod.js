import {
  ApplicationPaths,
  ClaimPaths,
  Form,
  POWERPOD,
  win,
} from './common/constants.js';
import { getOptions, setOption, setOptions } from './common/options.js';
import './common/scripts.js';
import './common/fetch.js';
import './common/env.ts';
import './common/program.ts';
import './common/form.js';
import { Logger } from './common/logger.js';
import { initApplication } from './application/application.js';
import { initClaim } from './claim/claim.js';

const logger = Logger('powerpod');

export default function powerpod(options) {
  // try to autodetect the form type if not passed
  if (!options?.form) {
    const { pathname: path } = win.location;
    if (ClaimPaths.some((claimPath) => path.includes(claimPath))) {
      logger.info({ message: `auto-detected ${Form.Claim} form` });
      setOption('form', Form.Claim);
    } else if (ApplicationPaths.some((appPath) => path.includes(appPath))) {
      logger.info({ message: `auto-detected ${Form.Application} form` });
      setOption('form', Form.Application);
    } else {
      logger.error({
        message: `Unable to autodetect form type, path: ${path}`,
      });
    }
  }

  // combine given options and default options
  setOptions(options);

  logger.info({ message: 'setting up API with options:', data: getOptions() });
  setAPI();

  switch (getOptions().form) {
    case Form.Application:
      logger.info({ message: `initializing ${Form.Application}` });
      initApplication();
      break;
    case Form.Claim:
      logger.info({ message: `initializing ${Form.Claim}` });
      initClaim();
      break;
    default:
      logger.error({
        message: 'unable to init, no form type defined in options',
      });
      break;
  }

  // @ts-ignore
  return win.powerpod;
}

function setAPI() {
  // @ts-ignore
  POWERPOD.getPowerpodData = function () {
    return {
      options: getOptions(),
    };
  };
  // @ts-ignore
  POWERPOD.version = '1.3.6';
  // @ts-ignore
  win.powerpod = POWERPOD;
}
