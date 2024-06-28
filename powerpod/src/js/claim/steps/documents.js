import { hideQuestion, observeIframeChanges } from '../../common/html.js';
import { getEnvVars } from '../../common/env.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { configureFields } from '../../common/fieldConfiguration.js';
import { setFieldValue } from '../../common/html.js';
import { setFieldReadOnly } from '../../common/fieldValidation.js';
import { Logger } from '../../common/logger.js';
import { saveFormData } from '../../common/saveButton.js';
import { addDocumentsStepText } from '../../common/documents.ts';

const logger = Logger('claim/steps/documents');

export async function customizeDocumentsStep() {
  const programAbbreviation = getProgramAbbreviation();
  if (
    programAbbreviation.includes('ABPP') ||
    programAbbreviation === 'NEFBA' ||
    programAbbreviation === 'NEFBA2' ||
    programAbbreviation.includes('KTTP')
  ) {
    addDocumentsStepText();
  }

  configureFields();

  if (programAbbreviation === 'NEFBA') {
    addSatisfactionSurveyChefsIframe();

    observeIframeChanges(
      customizeBusinessPlanDocumentsQuestions,
      null,
      'quartech_completingcategory'
    );
  }

  if (programAbbreviation === 'NEFBA2') {
    addSatisfactionSurveyChefsIframe();
  }
}

async function addSatisfactionSurveyChefsIframe() {
  $('#quartech_satisfactionsurveychefssubmissionid')
    ?.closest('tr')
    ?.css({ display: 'none' });

  setFieldReadOnly('quartech_satisfactionsurveyid');

  // Full length GUID for viewing results
  const chefsSubmissionGuid = $(
    '#quartech_satisfactionsurveychefssubmissionid'
  )?.val();

  // Shorthand ID result for Staff
  const chefsSubmissionId = $('#quartech_satisfactionsurveyid')?.val();

  if (chefsSubmissionGuid || chefsSubmissionId) {
    // Logic has since changed, if there's an ID present, we don't need to do anything.
    // chefsUrl = `https://submit.digital.gov.bc.ca/app/form/success?s=${chefsSubmissionGuid}`;

    logger.info({
      fn: addSatisfactionSurveyChefsIframe,
      message: `Satisfaction survey has already been completed, chefsSubmissionGuid: ${chefsSubmissionGuid}, chefsSubmissionId: ${chefsSubmissionId}`,
    });
    return;
  }

  const {
    quartech_ChefsNefbaSatisfactionSurveyFormId:
      chefsNefbaSatisfactionSurveyFormId,
  } = await getEnvVars();

  if (!chefsNefbaSatisfactionSurveyFormId) {
    logger.error({
      fn: addSatisfactionSurveyChefsIframe,
      message:
        'Bad config: Applicant Portal Config should contain the quartech_ChefsNefbaSatisfactionSurveyFormId element',
      data: { chefsNefbaSatisfactionSurveyFormId },
    });
  }

  const chefsUrl = `https://submit.digital.gov.bc.ca/app/form/submit?f=${chefsNefbaSatisfactionSurveyFormId}`;

  window.addEventListener('message', function (event) {
    if (event.origin != 'https://submit.digital.gov.bc.ca') {
      return;
    }
    const containSubmissionId = event.data.indexOf('submissionId') > -1;

    if (!containSubmissionId) return;

    const submissionPayload = JSON.parse(event.data);

    const chefsSubmissionGuidResult = submissionPayload.submissionId;

    console.log(
      'received chefsSubmissionGuidResult: ' + chefsSubmissionGuidResult
    );

    setFieldValue(
      'quartech_satisfactionsurveychefssubmissionid',
      chefsSubmissionGuidResult
    );

    const chefsSubmissionId = chefsSubmissionGuidResult
      .substring(0, 8)
      .toUpperCase();

    setFieldValue('quartech_satisfactionsurveyid', chefsSubmissionId);

    saveFormData({
      customPayload: {
        quartech_satisfactionsurveychefssubmissionid: chefsSubmissionGuidResult,
      },
    });
  });

  let div = document.createElement('div');
  div.innerHTML = `<iframe id='chefsSatisfactionSurveyIframe' src="${chefsUrl}" height="800" width="100%" title="Satisfaction Survey in CHEFS">
        </iframe><br/>`;

  const fieldLabelDivContainer = $(`#quartech_satisfactionsurveyid_label`)
    .parent()
    .parent();

  fieldLabelDivContainer.prepend(div);
}

function customizeBusinessPlanDocumentsQuestions() {
  const iframe = document.querySelector(
    'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
  );
  // @ts-ignore
  const innerDoc = iframe?.contentDocument
    ? // @ts-ignore
      iframe.contentDocument
    : // @ts-ignore
      iframe.contentWindow.document;
  const completingCategoryElement = innerDoc?.getElementById(
    'quartech_completingcategory'
  );
  if (!!completingCategoryElement) {
    if (completingCategoryElement?.value === '255550000') {
      hideQuestion('quartech_invoices');
      hideQuestion('quartech_proofofpayment');
    }
  }
}
