import { Hosts, POWERPOD, win } from './constants.js';
import { getEnvVarsData } from './fetch.js';
import { Logger } from './logger.js';

const logger = Logger('common/env');

POWERPOD.env = {
  getEnvVars,
  getEnv,
};

export function getEnv() {
  const { host } = win.location;

  const env = Object.keys(Hosts).find((key) => Hosts[key] === host);

  if (!env) {
    logger.error({
      fn: getEnv,
      message: 'Unable to determine current env',
      data: { host, Hosts },
    });
    return;
  }

  return env;
}

export async function getEnvVars() {
  const data = await getEnvVarsData();
  if (data?.['value']?.length) {
    const definitionsArray = data['value'];

    const res = definitionsArray.reduce((acc, def) => {
      const key = def['schemaname'];
      const value =
        def['environmentvariabledefinition_environmentvariablevalue']?.[0]?.[
          'value'
        ];
      return { ...acc, [key]: value };
    }, {});

    logger.info({
      fn: getEnvVars,
      message: 'successfully extracted env vars:',
      data: res,
    });
    return Promise.resolve(res);
  }
  let errorMsg = 'failed to extract env vars from data';
  logger.warn({
    fn: getEnvVars,
    message: errorMsg,
    data,
  });
  return Promise.reject(new Error(errorMsg));
}
