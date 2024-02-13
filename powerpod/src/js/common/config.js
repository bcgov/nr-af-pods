import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';

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
