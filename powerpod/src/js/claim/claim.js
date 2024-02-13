import { getClaimConfigData, getGlobalConfigData } from '../common/config.js';
import { FormStep } from '../common/constants.js';
import { getClaimFormData } from '../common/fetch.js';
import { hideFieldsAndSections } from '../common/html.js';
import { hideLoadingAnimation } from '../common/loading.js';
import { Logger } from '../common/logger.js';
import { getCurrentStep, getProgramId } from '../common/program.ts';
import { addNewAppSystemNotice } from '../common/system.js';
import { validateRequiredFields } from '../common/validation.js';
import { customizeApplicantInfoStep } from './steps/applicantInfo.js';
import { customizeDeclarationConsentStep } from './steps/declarationConsent.js';
import { customizeDocumentsStep } from './steps/documents.js';
import { customizeProjectResultsStep } from './steps/projectResults.js';

const logger = Logger('claim/claim');

export function initClaim() {
  hideFieldsAndSections();

  updatePageForSelectedProgram();

  addNewAppSystemNotice();
}

function updatePageForSelectedProgram(programid = undefined) {
  if (!programid) programid = getProgramId();

  logger.info({
    fn: updatePageForSelectedProgram,
    message: `Retrieving Program data for the selected programid querystring: ${programid}`,
  });

  getClaimFormData({
    programId: programid,
    beforeSend: () => {
      logger.info({
        fn: updatePageForSelectedProgram,
        message: 'clear any cached data from previous page loads',
      });
      localStorage.clear();
    },
    onSuccess: (programData, textStatus, xhr) => {
      if (programData) {
        logger.info({
          fn: updatePageForSelectedProgram,
          message: 'Retrieved Program data:',
          data: programData,
        });

        localStorage.setItem('programData', JSON.stringify(programData));

        logger.info({
          fn: updatePageForSelectedProgram,
          message: 'Update application page with the program data.',
        });
        populateContentForSelectedProgramStream(programData);
        hideLoadingAnimation();
        validateRequiredFields();
      }
    },
  });
}

function populateContentForSelectedProgramStream(programData) {
  // cleanup unnecessary divs
  document.querySelector('#page-title-container > p:nth-child(5)')?.remove();
  document.querySelector('#page-title')?.remove();
  document.querySelector('#page-subtitle')?.remove();
  document.querySelector('#page-title-container > p.smallText')?.remove();
  document.querySelector('#page-description')?.remove();

  // Populate the Page Title, Sub-Title and Description
  $('#page-title-container').prepend(
    programData.quartech_claimformheaderhtmlcontent
  );

  updateClaimFormStepForSelectedProgram(programData);
}

function updateClaimFormStepForSelectedProgram(programData) {
  const currentStep = getCurrentStep();
  switch (currentStep) {
    case FormStep.ApplicantInfo:
      customizeApplicantInfoStep();
      break;
    case FormStep.ProjectResults:
      customizeProjectResultsStep();
      break;
    case FormStep.Documents:
      customizeDocumentsStep(currentStep);
      break;
    case FormStep.Consent:
      customizeDeclarationConsentStep(programData);
      break;
    default:
      break;
  }
}
