import { hideQuestion, observeIframeChanges } from '../../common/html.js';
import { getCurrentStep, getProgramAbbreviation } from '../../common/program.ts';
import { setStepRequiredFields } from '../../common/setRequired.js';

export function customizeDocumentsStep() {
  setStepRequiredFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation === 'NEFBA') {
    observeIframeChanges(
      customizeBusinessPlanDocumentsQuestions,
      null,
      'quartech_completingcategory'
    );
  }

  if (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA') {
    if (!document.querySelector('#supportingDocumentationNote')) {
      const supportingDocumentationNoteHtmlContent = `
      <div id="supportingDocumentationNote" style="padding-bottom: 20px;">
        Please Choose or Drag & Drop files to the grey box below to upload the following documents as attachments (as applicable)
      </div>`;

      $('fieldset[aria-label="Supporting Documents"] > legend').after(
        supportingDocumentationNoteHtmlContent
      );
    }

    if (!document.querySelector('#beforeContinuingNote')) {
      const beforeContinuingNoteHtmlContent = `
        <div id="beforeContinuingNote" style="padding-bottom: 20px;">
          Please ensure you have the correct files before clicking “Next”. If you move to the next stage of the Claim for Payment form you can no longer delete uploaded files. However, you can always add new files.<br />
          <br />
          If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").
        </div>
      `;

      $('#EntityFormView').after(beforeContinuingNoteHtmlContent);
    }
  }
}

function customizeBusinessPlanDocumentsQuestions() {
  const iframe = document.querySelector(
    'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
  );
  // @ts-ignore
  const innerDoc = iframe?.contentDocument
    // @ts-ignore
    ? iframe.contentDocument
    // @ts-ignore
    : iframe.contentWindow.document;
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
