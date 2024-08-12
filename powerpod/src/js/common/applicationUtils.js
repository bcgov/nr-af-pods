import {
  POWERPOD,
  ApplicationPaths,
  ClaimPaths,
  Form,
  win,
} from './constants.js';
import { getCurrentUser } from './dynamics.ts';
import {
  getDraftApplicationsForProgramIdData,
  postApplicationData,
} from './fetch.js';
import { getFormId, getFormIdFromURLParams } from './form.js';
import { Logger } from './logger.js';
import { getProgramIdFromUrlParams } from './program.ts';

const logger = Logger('common/application');

POWERPOD.applicationUtils = {
  getFormType,
  preloadExistingDraftApplications: getExistingDraftApplicationId,
  getExistingDraftApplicationId,
  existingDraftApplications: null,
};

export function getFormType() {
  const { pathname: path } = window.location;
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
    logger.warn({
      fn: getFormType,
      message: `Unable to autodetect form type, path: ${path}`,
    });
  }
}

// export function getExistingDraftApplicationId() {
//   logger.info({
//     fn: getExistingDraftApplicationId,
//     message: 'Returning existing draft applications',
//     data: {
//       existingDrafts:
//         POWERPOD.applicationUtils?.existingDraftApplications || null,
//     },
//   });
//   if (
//     POWERPOD.applicationUtils?.existingDraftApplications &&
//     POWERPOD.applicationUtils?.existingDraftApplications.length > 0
//   ) {
//     const existingDraft = existingDraftApplications[0];
//     const { msgov_businessgrantapplicationid: id } = existingDraft;
//     logger.info({
//       fn: getExistingDraftApplicationId,
//       message: `Found existing draft application for programid: ${programId} with id: ${id}`,
//     });
//     return id;
//   }

//   logger.info({
//     fn: getExistingDraftApplicationId,
//     message:
//       'No existing draft applications found, or not loaded due to form id URL param passed in',
//   });
//   return '';
// }

export async function getExistingDraftApplicationId() {
  const formId = getFormIdFromURLParams();

  if (formId) {
    logger.info({
      fn: getExistingDraftApplicationId,
      message: 'No need to load drafts if specific form id passed by params',
    });
    return;
  }

  const programId = getProgramIdFromUrlParams();

  if (!programId) {
    logger.info({
      fn: getExistingDraftApplicationId,
      message:
        'No programId found in URL params, no need to load existing drafts',
    });
    return;
  }

  logger.info({
    fn: getExistingDraftApplicationId,
    message: `Querying for any existing draft applications for programId: ${programId}`,
  });

  // check if drafts cached already, if so, return
  if (
    POWERPOD.applicationUtils.existingDraftApplications &&
    POWERPOD.applicationUtils.existingDraftApplications.length > 0
  ) {
    return POWERPOD.applicationUtils.existingDraftApplications[0];
  }

  try {
    const res = await getDraftApplicationsForProgramIdData({
      programid: programId,
    });

    if (res && res.data && res.data?.value && res.data?.value?.length === 0) {
      logger.info({
        fn: getExistingDraftApplicationId,
        message: `No existing draft application found for programid: ${programId}, create a new application record`,
        data: { res },
      });

      const uuid = crypto.randomUUID();

      const { contactId } = getCurrentUser();

      let quartech_nocragstnumber = null;
      if (programId === '8806d490-8f44-ef11-a316-002248ae4517') {
        logger.info({
          fn: getExistingDraftApplicationId,
          message: `Detected VLB program id, starting app with quartech_nocragstnumber = true;`,
        });
        quartech_nocragstnumber = true;
      }

      const payload = {
        id: uuid,
        programid: programId,
        contactid: contactId,
        ...(quartech_nocragstnumber != null && { quartech_nocragstnumber }),
      };

      const response = await postApplicationData(payload);

      if (!response || response.jqXHR?.status !== 204) {
        logger.error({
          fn: getExistingDraftApplicationId,
          message: 'Failed to create new application',
          data: { payload, response },
        });
        return;
      }

      logger.info({
        fn: getExistingDraftApplicationId,
        message: `Successfully created new draft application found for programid: ${programId}, with id: ${uuid}`,
        data: { payload, response },
      });

      return uuid;
    }

    if (res && res.data && res.data?.value && res.data?.value?.length > 0) {
      if (res.data?.value?.length > 1) {
        logger.warn({
          fn: getExistingDraftApplicationId,
          message: `More than one draft application exists for programid: ${programId}`,
          data: { res },
        });
      }

      const existingDraftApplications = res.data.value;

      const existingDraft = existingDraftApplications[0];
      const { msgov_businessgrantapplicationid: id } = existingDraft;

      logger.info({
        fn: getExistingDraftApplicationId,
        message: `Found existing draft application for programid: ${programId} with id: ${id}`,
      });
      POWERPOD.applicationUtils.existingDraftApplications =
        existingDraftApplications;
      return id;
    }
  } catch (e) {
    logger.error({
      fn: getExistingDraftApplicationId,
      message: `Error getting draft applications for programid: ${programId}`,
      data: { e },
    });
    return;
  }

  logger.error({
    fn: getExistingDraftApplicationId,
    message: `Some issue occured trying to get existing draft applications for programid: ${programId}`,
  });
  return '';
}
