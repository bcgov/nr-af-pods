import { FormStep, POWERPOD, doc } from '../common/constants.js';
import { getApplicationFormData } from '../common/fetch.js';
import { hideLoadingAnimation } from '../common/loading.js';
import { Logger } from '../common/logger.js';
import {
  getCurrentStep,
  getProgramAbbreviation,
  getProgramId,
} from '../common/program.ts';
import { validateRequiredFields } from '../common/fieldValidation.js';

// step logic
import { customizeApplicantInfoStep } from './steps/applicantInfo.js';
import { customizeProjectStep } from './steps/project.js';
import { customizeEligibilityStep } from './steps/eligibility.js';
import { customizeDeclarationConsentStep } from './steps/declarationConsent.js';
import { customizeDeliverablesBudgetStep } from './steps/deliverablesBudget.js';
import { customizeDemographicInfoStep } from './steps/demographicInfo.js';
import { customizeDocumentsStep } from './steps/documents.js';
import {
  hideFieldsAndSections,
  onDocumentReadyState,
  redirectToFormId,
} from '../common/html.js';
import { getGlobalConfigData } from '../common/config.js';
import { addFormDataOnClickHandler } from '../common/form.js';
import { preloadRequestVerificationToken } from '../common/dynamics.ts';
import { getExistingDraftApplicationId } from '../common/applicationUtils.js';

const logger = Logger('application/application');

export function initApplication() {
  preloadRequestVerificationToken();
  hideFieldsAndSections();
  if (getCurrentStep() === FormStep.DemographicInfo) {
    updatePageForDemographicStep();
  } else {
    updatePageForSelectedProgram();
  }
  // addNewAppSystemNotice();

  customizePageForFirefox();
}

function updatePageForDemographicStep() {
  var demographicInfoStepIframe = document.getElementById(
    'ApplicationDemographicInfoStepQuickViewForm'
  );
  demographicInfoStepIframe.addEventListener('load', function () {
    var programid = document
      .querySelector('#ApplicationDemographicInfoStepQuickViewForm')
      // @ts-ignore
      ?.contentWindow?.document?.querySelector('#quartech_program')?.value;

    updatePageForSelectedProgram(programid);
  });
}

function customizePageForFirefox() {
  // if (!navigator.userAgent.includes("Firefox")) return;

  let codingSection = $("[data-name='applicantInfoTab_CodingSection']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }

  codingSection = $("[data-name='eligibilityTab_CodingSection']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }

  codingSection = $("[data-name='projectTab_CodingSection']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }

  codingSection = $("[data-name='tab_Deliverables_Budget_section_Coding']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }

  codingSection = $("[data-name='documentsTab_CodingSection']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }

  codingSection = $("[data-name='section_Coding']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }

  codingSection = $("[data-name='tab_Declaration_Consent_section_Coding']");
  if (codingSection.length > 0) {
    codingSection.parent().css('display', 'none');
  }
}

async function updatePageForSelectedProgram(programId = undefined) {
  let formId, redirect;
  if (!programId) {
    const {
      programId: fetchedProgramId,
      formId: fetchedFormId,
      redirect: fetchedRedirect,
    } = await getProgramId();
    programId = fetchedProgramId;
    formId = fetchedFormId;
    redirect = fetchedRedirect || false;
  }

  if ((POWERPOD.redirectToNewId || redirect) && formId) {
    logger.info({
      fn: updatePageForSelectedProgram,
      message: `Stop updating page,redirect to new formId: ${formId}`,
      data: { redirectToNewId: POWERPOD.redirectToNewId, formId },
    });
    redirectToFormId(formId);
    return;
  }

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

  getApplicationFormData({
    programId: programId,
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
        updateFormStepForSelectedProgram(programData);
        hideLoadingAnimation();
        validateRequiredFields();

        addFormDataOnClickHandler(); // for form data json generation
      }
    },
  });
}

function populateProgramLookup(programGuid, programName) {
  $('#quartech_program').val(programGuid);
  $('#quartech_program_name').val(programName);
  $('#quartech_program_entityname').val('msgov_program');
}

function populateContentForSelectedProgramStream(programData) {
  // Populate the Page Title, Sub-Title and Description
  $('#page-title').text(programData.quartech_portalapplicationpagetitle);
  $('#page-subtitle').text(programData.quartech_portalapplicationpagesubtitle);
  $('#page-description').html(
    programData.quartech_portalapplicationpagedescription
  );

  // Populate the Program lookup, hidden at the bottom of the Applicant Information step/tab
  let selectedProgramGuid = $('#quartech_program').val();

  if (!selectedProgramGuid) {
    // auto-select the program lookup, hidden field on the Applicant Info step based on the selected programid
    populateProgramLookup(
      programData.msgov_programid,
      programData.msgov_programname
    );
  }
}

function updateFormStepForSelectedProgram(programData) {
  logger.info({
    fn: updateFormStepForSelectedProgram,
    message: 'Begin updating form step for program',
  });
  populateContentForSelectedProgramStream(programData);

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation && programAbbreviation === 'NEFBA') {
    $("div[id*='ProgressIndicator'] li:contains('Deliverables & Budget')").css(
      'display',
      'none'
    );
    $("div[id*='ProgressIndicator'] li:contains('Documents')").css(
      'display',
      'none'
    );
  } else if (programAbbreviation && programAbbreviation.includes('KTTP')) {
    $("div[id*='ProgressIndicator'] li:contains('Documents')").css(
      'display',
      'none'
    );
    $("div[id*='ProgressIndicator'] li:contains('Eligibility')").css(
      'display',
      'none'
    );
  }

  const currentStep = getCurrentStep();
  switch (currentStep) {
    case FormStep.ApplicantInfo:
      customizeApplicantInfoStep(programData);
      break;
    case FormStep.Eligibility:
      customizeEligibilityStep(programData);
      break;
    case FormStep.Project:
      customizeProjectStep(programData);
      break;
    case FormStep.DeliverablesBudget:
      customizeDeliverablesBudgetStep();
      // customizeEstimatedActivityBudgetStepForKTTP(programData);
      // initEstimatedActivityBudgetCalculationForKTTP(programData);
      break;
    case FormStep.Documents:
      customizeDocumentsStep();
      break;
    case FormStep.DemographicInfo:
      customizeDemographicInfoStep(programData);
      break;
    case FormStep.DeclarationAndConsent:
      customizeDeclarationConsentStep(programData);
      break;
    default:
      break;
  }

  updateFieldsHintTextsByConfigData();
}

function updateFieldsHintTextsByConfigData() {
  const fieldsHintTexts = getGlobalConfigData()?.FieldsHintTexts;

  if (!fieldsHintTexts) return;

  const currentStep = getCurrentStep();
  switch (currentStep) {
    case FormStep.ApplicantInfo:
      updateFieldsHintTexts(fieldsHintTexts.ForApplicantInfoStep);
      break;
    case FormStep.Project:
      updateFieldsHintTexts(fieldsHintTexts.ForProjectStep);
      break;
    case FormStep.DemographicInfo:
      updateFieldsHintTexts(fieldsHintTexts.ForDemographicInfoStep);
      break;
    case FormStep.DeclarationAndConsent:
      updateFieldsHintTexts(fieldsHintTexts.ForDeclarationAndConsentStep);
      break;
    default:
      break;
  }
}

function updateFieldsHintTexts(fieldsHintTextsMap) {
  if (!fieldsHintTextsMap) return;

  fieldsHintTextsMap.forEach((fieldData, index) => {
    const fieldName = fieldData?.FieldName;
    const hintText = fieldData?.HintText;

    if (fieldName && hintText) {
      $(`#${fieldName}`).attr('placeholder', hintText);
    }
  });
}
