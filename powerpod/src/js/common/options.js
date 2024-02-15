import { Environment, Form, Hosts } from './constants.js';
import * as utils from './utils.js';

// TODO: Update for production
const ALLOWED_ENVS = [Environment.DEV, Environment.TEST, Environment.PROD];
const ALLOWED_HOSTS = [
  Hosts[Environment.DEV],
  Hosts[Environment.TEST],
  Hosts[Environment.PROD],
];
const ALLOWED_PATHS = [
  '/claim/',
  '/claim-dev/',
  '/application/',
  '/application-dev/',
];
export const ENV_LOG_LEVEL = {
  [Environment.DEV]: 10, // show all on DEV
  [Environment.TEST]: 20, // only show WARN & ERROR on TEST
  [Environment.PROD]: 90, // only show ERROR on PROD
};
const defaultOptions = {
  autoinit: true,
  env: Environment.DEV,
  logging: true,
  // TODO: implement log level filtering
  logLevel: ENV_LOG_LEVEL[Environment.DEV],
  form: null, // if null, will try to auto-detect the form
  allowedHosts: [...ALLOWED_HOSTS],
  allowedPaths: [...ALLOWED_PATHS],
  allowedEnvs: [...ALLOWED_ENVS],
};

var g_options = null;
let originals = utils.deepExtend({}, defaultOptions); //deep copy

export function getOptions() {
  return g_options || defaultOptions;
}

export function setOptions(options) {
  g_options = utils.deepExtend({}, defaultOptions, options);
  originals = Object.assign({}, g_options);
  return g_options;
}

export function setOption(name, value) {
  defaultOptions[name] = value;
}

export function getOriginals() {
  return originals;
}
