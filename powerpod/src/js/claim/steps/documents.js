import { hideQuestion, observeIframeChanges } from '../../common/html.js';
import { getEnvVars } from '../../common/env.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { configureFields } from '../../common/fieldConfiguration.js';
import { setFieldValue } from '../../common/html.js';
import { setFieldReadOnly } from '../../common/fieldValidation.js';
import { customizeDocumentsControls } from '../documents.js';
import { CLAIM_FILE_UPLOAD_FIELDS } from '../../common/documents.ts';

export async function customizeDocumentsStep() {
  const programAbbreviation = getProgramAbbreviation();
  if (
    programAbbreviation.includes('ABPP') ||
    programAbbreviation === 'NEFBA' ||
    programAbbreviation === 'NEFBA2' ||
    programAbbreviation.includes('KTTP')
  ) {
    if (!document.querySelector('#supportingDocumentationNote')) {
      const supportingDocumentationNoteHtmlContent = `
      <style>
        sl-tooltip::part(body) {
          font-size: 1.2rem;
        }
      </style>
      <div id="supportingDocumentationNote" style="padding-bottom: 20px;">
        Please choose or drag & drop files to the box below to upload the following documents as attachments (as applicable).
        <br /><br />
        You can upload a file up to 15MB each in the 
        <sl-tooltip>
          <div slot="content">
            Text/Document Files
            <ul>
              <li>CSV (Comma Separated Values)</li>
              <li>DOC (Microsoft Word Document)</li>
              <li>DOCX (Microsoft Word Open XML Document)</li>
              <li>ODT (Open Document Text File)</li>
              <li>PDF (Portable Document Format File)</li>
            </ul>

            Spreadsheet Files
            <ul>
              <li>XLS (Excel Spreadsheet)</li>
              <li>XLSX (Microsoft Excel Open XML Spreadsheet)</li>
              <li>ODS (Open Document Spreadsheet File)</li>
            </ul>

            Image Files
            <ul>
              <li>GIF (Graphical Interchange Format File)</li>
              <li>JPEG (JPEG Image File)</li>
              <li>JPG (JPEG Image File)</li>
              <li>PNG (Portable Network Graphic)</li>
              <li>SVG (Scalable Vector Graphics File)</li>
              <li>TIF (Tagged Image File)</li>
            </ul>
          </div>
          <a href="" style="font-size: 15px">supported file formats</a>.
        </sl-tooltip>
      </div>`;

      $('fieldset[aria-label="Supporting Documents"] > legend').after(
        supportingDocumentationNoteHtmlContent
      );

      const beforeContinuingNoteHtmlContent = `
        <div id="beforeContinuingNote" style="padding-bottom: 20px;">
          Please ensure you have the correct files before clicking “Next”. If you move to the next stage of the Claim for Payment form you can no longer delete uploaded files. However, you can always add new files.<br />
          <br />
          If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").
        </div>
      `;

      $('fieldset[aria-label="Supporting Documents"]').after(
        beforeContinuingNoteHtmlContent
      );
    }
  }

  // customizeDocumentsControls(CLAIM_FILE_UPLOAD_FIELDS);
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

  const chefsSubmissionId = $(
    '#quartech_satisfactionsurveychefssubmissionid'
  )?.val();
  let chefsUrl = '';

  if (chefsSubmissionId) {
    chefsUrl = `https://submit.digital.gov.bc.ca/app/form/success?s=${chefsSubmissionId}`;
  } else {
    const {
      quartech_ChefsNefbaSatisfactionSurveyFormId:
        chefsNefbaSatisfactionSurveyFormId,
    } = await getEnvVars();

    if (!chefsNefbaSatisfactionSurveyFormId) {
      alert(
        'Bad config: Applicant Portal Config should contain the quartech_ChefsNefbaSatisfactionSurveyFormId element'
      );
    }
    chefsUrl = `https://submit.digital.gov.bc.ca/app/form/submit?f=${chefsNefbaSatisfactionSurveyFormId}`;

    window.addEventListener('message', function (event) {
      if (event.origin != 'https://submit.digital.gov.bc.ca') {
        return;
      }
      const containSubmissionId = event.data.indexOf('submissionId') > -1;

      if (!containSubmissionId) return;

      const submissionPayload = JSON.parse(event.data);

      console.log('received submissionId: ' + submissionPayload.submissionId);

      $('#quartech_satisfactionsurveychefssubmissionid').val(
        submissionPayload.submissionId
      );

      const confirmationId = submissionPayload.submissionId
        .substring(0, 8)
        .toUpperCase();

      setFieldValue('quartech_satisfactionsurveyid', confirmationId);
    });

    let div = document.createElement('div');
    div.innerHTML = `<iframe id='chefsSatisfactionSurveyIframe' src="${chefsUrl}" height="800" width="100%" title="Satisfaction Survey in CHEFS">
        </iframe><br/>`;

    const fieldLabelDivContainer = $(`#quartech_satisfactionsurveyid_label`)
      .parent()
      .parent();

    fieldLabelDivContainer.prepend(div);
  }
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
