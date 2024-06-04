import {
  POWERPOD,
  ApplicationPaths,
  ClaimPaths,
  Form,
  win,
} from './constants.js';
import { getDraftApplicationsForProgramIdData } from './fetch.js';
import { Logger } from './logger.js';

const logger = Logger('common/application');

POWERPOD.applicationUtils = {
  getFormType,
  getExistingApplicationRecords: getExistingDraftApplication,
};

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

export async function getExistingDraftApplication(programId) {
  logger.info({
    fn: getExistingDraftApplication,
    message: `Querying for any existing draft applications for programId: ${programId}`,
  });

  try {
    const res = await getDraftApplicationsForProgramIdData(programId);

    if (res && res.data && res.data?.value && res.data?.value?.length === 0) {
      logger.info({
        fn: getExistingDraftApplication,
        message: `No existing draft application found for programid: ${programId}`,
        data: { res },
      });
      return '';
    }

    if (res && res.data && res.data?.value && res.data?.value?.length > 0) {
      if (res.data?.value?.length > 1) {
        logger.warn({
          fn: getExistingDraftApplication,
          message: `More than one draft application exists for programid: ${programId}`,
          data: { res },
        });
      }

      const existingDraft = res.data.value[0];
      const { msgov_businessgrantapplicationid: id } = existingDraft;

      logger.info({
        fn: getExistingDraftApplication,
        message: `Found existing draft application for programid: ${programId} with id: ${id}`,
      });
      return id;
    }
  } catch (e) {
    logger.error({
      fn: getExistingDraftApplication,
      message: `Error getting draft applications for programid: ${programId}`,
      data: { e },
    });
    return;
  }

  logger.error({
    fn: getExistingDraftApplication,
    message: `Some issue occured trying to get existing draft applications for programid: ${programId}`,
  });
  return '';
}
