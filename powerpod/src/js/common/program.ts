import { POWERPOD, FormStep, TabDisplayNames, doc } from './constants.js';
import { htmlDecode, onDocumentReadyState } from './html.js';
import { Logger } from './logger.js';

const logger = new Logger('common/program');

POWERPOD.program = {
  programId: null,
  getProgramId,
  getProgramAbbreviation,
  getCurrentStep,
};

/**
 * Gets the ID of the currently active program.
 * @function
 */
export function getProgramId() {
  if (POWERPOD.programId?.programId) {
    const programId = POWERPOD.programId?.programId;
    logger.info({
      fn: getProgramId,
      message: `Cached programId found, returning ${programId}`,
    });
    return programId;
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
    programIdHiddenValue &&
    programIdParam &&
    programIdHiddenValue != programIdParam
  ) {
    logger.warn({
      fn: getProgramId,
      message: `Program id in URL path differs from program id found in element, fixing url path`,
      data: {
        readyState: doc.readyState,
        programIdParam,
        programIdHiddenValue,
      },
    });
    let newUrl = doc.location.href.replace(
      programIdParam,
      // @ts-ignore
      programIdHiddenValue
    );
    location.replace(newUrl);
  }
  const programId = programIdHiddenValue || programIdParam;
  if (!programId) {
    logger.error({
      fn: getProgramId,
      message:
        'Could not find program id in either coding section or url params. ' +
        'Check that HTML content is present in Portal Management.',
    });
  }
  // @ts-ignore
  POWERPOD.program.programId = programId;
  return programId;
}

export function getProgramAbbreviation() {
  const programData = localStorage.getItem('programData');
  const programAbbreviation =
    JSON.parse(programData)?.quartech_programabbreviation;
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
      logger.info({
        fn: getCurrentStep,
        message: `Trying to find formStep for activeTabName: ${activeTabName}`,
        data: {
          TabNames: TabDisplayNames,
          formStep,
          stepName: TabDisplayNames[formStep],
        },
      });
      return (
        TabDisplayNames[formStep] === activeTabName ||
        TabDisplayNames[formStep].includes(activeTabName)
      );
    }) ?? activeStep;

  logger.info({
    fn: getCurrentStep,
    message: `Validating current step ${activeStep}`,
    data: {
      activeTabName,
      TabNames: TabDisplayNames,
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
      data: { activeStep, activeTabName, TabNames: TabDisplayNames, FormStep },
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
