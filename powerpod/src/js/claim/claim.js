import { FormStep, doc } from '../common/constants.js';
import { getClaimFormData } from '../common/fetch.js';
import { addFormDataOnClickHandler } from '../common/form.js';
import { hideFieldsAndSections, onDocumentReadyState } from '../common/html.js';
import { hideLoadingAnimation } from '../common/loading.js';
import { Logger } from '../common/logger.js';
import {
  getCurrentStep,
  getProgramData,
  getProgramId,
} from '../common/program.ts';
import { validateRequiredFields } from '../common/fieldValidation.js';
import { customizeApplicantInfoStep } from './steps/applicantInfo.js';
import { customizeClaimInfoStep } from './steps/claimInfoStep.js';
import { customizeDeclarationConsentStep } from './steps/declarationConsent.js';
import { customizeDocumentsStep } from './steps/documents.js';
import { customizeProjectResultsStep } from './steps/projectResults.js';
import { preloadRequestVerificationToken } from '../common/dynamics.ts';
import { addSaveButton } from '../common/saveButton.js';

const logger = Logger('claim/claim');

export function initClaim() {
  preloadRequestVerificationToken();
  hideFieldsAndSections();
  updatePageForSelectedProgram();
  // addNewAppSystemNotice();
}

async function updatePageForSelectedProgram() {
  const { programId } = await getProgramId();

  if (!programId && doc.readyState !== 'complete') {
    logger.info({
      fn: updatePageForSelectedProgram,
      message: 'Could not find programid, retry when DOM readyState is comlete',
      data: {
        readyState: doc.readyState,
      },
    });
    onDocumentReadyState(() => {
      updatePageForSelectedProgram();
    });
    return;
  }

  const currentStep = getCurrentStep();

  addSaveButton();

  if (!programId || currentStep === 'UnknownStep') {
    hideLoadingAnimation();
    logger.error({
      fn: updatePageForSelectedProgram,
      message: 'Missing programid, or unknown current step',
      data: {
        programid: programId,
        currentStep,
      },
    });
    return;
  }

  logger.info({
    fn: updatePageForSelectedProgram,
    message: `Retrieving Program data for the selected programid querystring: ${programId}`,
  });

  getClaimFormData({
    programId: programId,
    beforeSend: () => {
      logger.info({
        fn: updatePageForSelectedProgram,
        message: 'clear any cached data from previous page loads',
      });
      if (localStorage.getItem('programData')) {
        localStorage.removeItem('programData');
      }
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
        populateContentForSelectedProgramStream();
        hideLoadingAnimation();
        validateRequiredFields();
        addFormDataOnClickHandler(); // for form data json generation
      }
    },
  });
}

function populateContentForSelectedProgramStream() {
  // cleanup unnecessary divs
  document.querySelector('#page-title-container > p:nth-child(5)')?.remove();
  document.querySelector('#page-title')?.remove();
  document.querySelector('#page-subtitle')?.remove();
  document.querySelector('#page-title-container > p.smallText')?.remove();
  document.querySelector('#page-description')?.remove();

  // Populate the Page Title, Sub-Title and Description
  $('#page-title-container').prepend(
    getProgramData()?.quartech_claimformheaderhtmlcontent
  );

  updateClaimFormStepForSelectedProgram();
}

function updateClaimFormStepForSelectedProgram() {
  const currentStep = getCurrentStep();
  switch (currentStep) {
    case FormStep.ApplicantInfo:
      customizeApplicantInfoStep();
      break;
    case FormStep.ProjectResults:
      customizeProjectResultsStep();
      break;
    case FormStep.ClaimInfo:
      customizeClaimInfoStep();
      break;
    case FormStep.Documents:
      customizeDocumentsStep();
      break;
    case FormStep.DeclarationAndConsent:
      customizeDeclarationConsentStep();
      break;
    default:
      break;
  }
}
