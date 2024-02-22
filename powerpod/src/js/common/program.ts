import { POWERPOD, FormStep, TabNames, doc } from './constants.js';
import { htmlDecode } from './html.js';
import { Logger } from './logger.js';

const logger = new Logger('common/program');

POWERPOD.program = {
  getProgramId,
  getProgramAbbreviation,
  getCurrentStep,
};

/**
 * Gets the ID of the currently active program.
 * @function
 */
export function getProgramId() {
  // Try to pull programId from hidden field
  logger.info({
    fn: getProgramId,
    message: 'attempting to get program id',
    data: {
      readyState: doc.readyState,
    }
  })
  const programId = $('#quartech_program')?.val();

  if (programId) {
    return programId;
  }

  // Try and get it from URL path
  const params = new URLSearchParams(doc.location.search);
  const programIdParam = params.get('programid');

  if (programIdParam) {
    return programIdParam;
  }

  if (programId && programIdParam && programId != programIdParam) {
    // @ts-ignore
    let newUrl = doc.location.href.replace(programIdParam, programId);
    location.replace(newUrl);
    return programId;
  } else {
    return programIdParam;
  }
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
    Object.keys(TabNames).find((formStep) => {
      logger.info({
        fn: getCurrentStep,
        message: `Trying to find formStep for activeTabName: ${activeTabName}`,
        data: {
          TabNames,
          formStep,
          stepName: TabNames[formStep],
        },
      });
      return (
        TabNames[formStep] === activeTabName ||
        TabNames[formStep].includes(activeTabName)
      );
    }) ?? activeStep;

  logger.info({
    fn: getCurrentStep,
    message: `Validating current step ${activeStep}`,
    data: {
      activeTabName,
      TabNames,
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
      data: { activeStep, activeTabName, TabNames, FormStep },
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
