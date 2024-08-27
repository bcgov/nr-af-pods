import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';
// UNCOMMENT THIS IF YOU WANT TO FORCE TO USE LOCAL JSON CONFIG:
// import localConfigJson from '../../../../assets/application/json/quartech_applicantportalapplicationformconfigjson_kttp1.json';
import localConfigJson from '../../../../assets/application/json/quartech_applicantportalapplicationformconfigjson_abpp1.json';

const logger = Logger('common/config');

POWERPOD.config = {
  getGlobalConfigData,
  getClaimConfigData,
  getApplicationConfigData,
};

export function getGlobalConfigData() {
  const programData = localStorage.getItem('programData');
  const configDataJSON =
    JSON.parse(programData)?.quartech_ApplicantPortalConfig
      ?.quartech_configdata;

  if (!configDataJSON) {
    logger.error({
      fn: getGlobalConfigData,
      message: 'Could not find config data json, check global JSON config data',
      data: { programData, configDataJSON },
    });
    return;
  }
  const podsConfigData = JSON.parse(configDataJSON);

  logger.info({
    fn: getApplicationConfigData,
    message: 'successfully fetched global config data from storage',
    data: podsConfigData,
  });
  return podsConfigData;
}

export function getClaimConfigData() {
  const programData = localStorage.getItem('programData');
  const configDataJSON =
    JSON.parse(programData)?.quartech_applicantportalclaimformjson;

  if (!configDataJSON) {
    logger.error({
      fn: getClaimConfigData,
      message:
        'Failed to get Claim config data, check quartech_applicantportalclaimformjson for the program in MS Dynamics.',
      data: {
        programData,
        configDataJSON,
      },
    });
    return;
  }

  const podsConfigData = JSON.parse(configDataJSON);

  logger.info({
    fn: getApplicationConfigData,
    message: 'successfully fetched claim config data from storage',
    data: podsConfigData,
  });
  return podsConfigData;
}

export function getApplicationConfigData(programId) {
  const { pathname: path } = window.location;
  logger.info({
    fn: getApplicationConfigData,
    message:
      'checking path to determine if we should use localhost or hosted data',
    data: { path },
  });

  // UNCOMMENT THIS IF YOU WANT TO FORCE TO USE LOCAL JSON CONFIG
  if (path.includes('application-dev') && localConfigJson) {
    logger.info({
      fn: getApplicationConfigData,
      message: 'successfully fetched application config data from localhost',
      data: { localConfigJson },
    });
    return localConfigJson;
  }
  // UNCOMMENT THIS IF YOU WANT TO FORCE TO USE LOCAL JSON CONFIG

  const programData = localStorage.getItem('programData');

  const configDataJSON =
    JSON.parse(programData)?.quartech_applicantportalapplicationformconfigjson;
  const podsConfigData = JSON.parse(configDataJSON);

  logger.info({
    fn: getApplicationConfigData,
    message: 'successfully fetched application config data from storage',
    data: podsConfigData,
  });
  return podsConfigData;
}
