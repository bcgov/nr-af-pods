import {
  getExistingDraftApplicationId,
  getExistingDraftApplicationId,
} from './applicationUtils.js';
import { getApplicationConfigData } from './config.js';
import { POWERPOD, FormStep, TabDisplayNames, doc } from './constants.js';
import { getDraftApplicationsForProgramIdData } from './fetch.js';
import { htmlDecode, onDocumentReadyState, redirectToFormId } from './html.js';
import { Logger } from './logger.js';

const logger = Logger('common/program');

POWERPOD.program = {
  programId: null,
  getProgramId,
  getProgramAbbreviation,
  getCurrentStep,
};

export function getProgramIdFromUrlParams() {
  const params = new URLSearchParams(doc.location.search);
  const programIdParam = params.get('programid');

  if (!programIdParam) {
    logger.info({
      fn: getProgramIdFromUrlParams,
      message: 'No programId found in URL params',
    });
    return;
  }

  logger.info({
    fn: getProgramIdFromUrlParams,
    message: `Success! Found program id in URL path ${programIdParam}`,
    data: {
      readyState: doc.readyState,
      programIdParam,
    },
  });
  return programIdParam;
}

/**
 * Gets the ID of the currently active program.
 * @function
 */
export async function getProgramId() {
  if (POWERPOD.program?.programId) {
    const programId = POWERPOD.program?.programId;
    const formId = POWERPOD.form?.id ?? null;
    logger.info({
      fn: getProgramId,
      message: `Cached programId found, returning ${programId}`,
    });
    return { programId, formId };
  }
  // Try and get it from URL path
  logger.info({
    fn: getProgramId,
    message: 'attempting to get program id from URL path',
    data: {
      readyState: doc.readyState,
    },
  });

  const params = new URLSearchParams(doc.location.search);
  const programIdParam = params.get('programid');

  if (programIdParam) {
    logger.info({
      fn: getProgramId,
      message: `Success! Found program id in URL path ${programIdParam}`,
      data: {
        readyState: doc.readyState,
        programIdParam,
      },
    });
  }

  const hiddenProgramElement = $('#quartech_program');
  const programIdHiddenValue = hiddenProgramElement?.val();

  if (programIdHiddenValue) {
    logger.info({
      fn: getProgramId,
      message: `Success! Found program id in hidden #quartech_program element ${programIdHiddenValue}`,
      data: {
        readyState: doc.readyState,
        hiddenProgramElement,
        programId: programIdHiddenValue,
      },
    });
  } else {
    logger.warn({
      fn: getProgramId,
      message: `Could not find program id in hidden #quartech_program element ${programIdHiddenValue}`,
      data: {
        readyState: doc.readyState,
        hiddenProgramElement,
        programId: programIdHiddenValue,
      },
    });
  }
  if (
    (programIdHiddenValue &&
      programIdParam &&
      programIdHiddenValue != programIdParam) ||
    (programIdHiddenValue == undefined && programIdParam)
  ) {
    logger.warn({
      fn: getProgramId,
      message: `Program id in URL path differs from program id found in element, checking for existing draft applications with programid: ${programIdParam}`,
      data: {
        readyState: doc.readyState,
        programIdParam,
        programIdHiddenValue,
      },
    });
    const existingDraftApplicationId = await getExistingDraftApplicationId();

    if (existingDraftApplicationId && existingDraftApplicationId.length > 0) {
      logger.info({
        fn: getProgramId,
        message: `Appending existing app id to URL, existingDraftApplicationId: ${existingDraftApplicationId}, for programid: ${programIdParam}`,
      });

      // redirectToFormId(existingDraftApplicationId);
      POWERPOD.doNotUnhideLoader = true;
      POWERPOD.redirectToNewId = true;
    }
    // hiddenProgramElement.val(programIdParam);
    // logger.info({
    //   fn: getProgramId,
    //   message: `Success! Found program id in URL path, returning: ${programIdParam}`,
    //   data: {
    //     readyState: doc.readyState,
    //     programIdParam,
    //     programIdHiddenValue,
    //   },
    // });
    return {
      programId: programIdParam,
      formId: existingDraftApplicationId,
      redirect: true,
    };
  }

  // This logic has been commented out since Multi Draft Applications were introduced.
  // Instead of correcting URL path, now we should do the following
  // 1. Query for existing draft applications with the given programid in the URL params.
  // 2. If one exists, redirect to &id={applicationId}, if it does NOT exist, then create
  //    a new draft application record, and redirect user to it.
  // if (
  //   programIdHiddenValue &&
  //   programIdParam &&
  //   programIdHiddenValue != programIdParam
  // ) {
  //   logger.warn({
  //     fn: getProgramId,
  //     message: `Program id in URL path differs from program id found in element, fixing url path`,
  //     data: {
  //       readyState: doc.readyState,
  //       programIdParam,
  //       programIdHiddenValue,
  //     },
  //   });
  //   let newUrl = doc.location.href.replace(
  //     programIdParam,
  //     // @ts-ignore
  //     programIdHiddenValue
  //   );
  //   location.replace(newUrl);
  // }

  // New logic:
  // const existingDraftApplicationId =

  let programId = programIdHiddenValue || programIdParam;
  if (!programId) {
    logger.warn({
      fn: getProgramId,
      message:
        `Could not find program id in either coding section or url params. ` +
        `As a last resort, pull programId from config data`,
    });
    const config = getApplicationConfigData();
    programId = config.programId;
  }
  if (!programId) {
    logger.error({
      fn: getProgramId,
      message:
        'Could not find program id in either coding section or url params. ' +
        'Check that HTML content and/or config programId is present in Portal Management.',
    });
  }

  logger.info({
    fn: getProgramId,
    message: `No mismatch or drafts to look up, succesfully found programid: ${programId}`,
  });

  // @ts-ignore
  POWERPOD.program.programId = programId;
  return { programId };
}

export function getProgramAbbreviation() {
  const programData = localStorage.getItem('programData');
  const programAbbreviation =
    JSON.parse(programData)?.quartech_programabbreviation;

  if (!programAbbreviation) {
    logger.error({
      fn: getProgramAbbreviation,
      message: 'Failed to get program abbreviation',
    });
    return;
  }
  return programAbbreviation;
}

export function getCurrentStep() {
  let activeStep: string = FormStep.Unknown;

  const activeTabName = htmlDecode(
    $('div > ol > li.list-group-item.active').html()
  );

  if (!activeTabName || activeTabName.length === 0) {
    logger.error({
      fn: getCurrentStep,
      message: 'Failed to get activeTabName',
      data: { activeTabName },
    });
    return activeStep;
  }

  activeStep =
    Object.keys(TabDisplayNames).find((formStep) => {
      const tabDisplayName = TabDisplayNames[formStep];
      logger.info({
        fn: getCurrentStep,
        message: `Trying to find formStep for activeTabName: ${activeTabName}`,
        data: {
          TabDisplayNames,
          formStep,
          tabDisplayName,
        },
      });
      return (
        tabDisplayName === activeTabName ||
        tabDisplayName.includes(activeTabName)
      );
    }) ?? activeStep;

  logger.info({
    fn: getCurrentStep,
    message: `Validating current step ${activeStep}`,
    data: {
      activeTabName,
      TabDisplayNames,
    },
  });

  // Check to ensure that the step valid before returning
  if (
    activeStep &&
    activeStep !== FormStep.Unknown &&
    Object.values(FormStep).includes(activeStep)
  ) {
    logger.info({
      fn: getCurrentStep,
      message: `Successfully found current step ${activeStep}`,
    });
    return activeStep;
  }

  if (!activeStep || activeStep === FormStep.Unknown) {
    logger.error({
      fn: getCurrentStep,
      message: 'Unable to determine current step',
      data: { activeStep, activeTabName, TabDisplayNames, FormStep },
    });
  }

  return FormStep.Unknown;
}

export function getProgramEmailAddress() {
  const programData = localStorage.getItem('programData');
  const programEmailAddress =
    JSON.parse(programData)?.quartech_programemailaddress;
  return programEmailAddress;
}

export function getProgramData() {
  const programData = localStorage.getItem('programData');
  return JSON.parse(programData);
}
